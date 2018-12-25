
import * as _ from 'lodash';
import * as Debugger from 'debug';
import * as collie from 'collie';
import * as statuses from 'statuses';
import { ServiceOptions, Extension, Plugin, MainService, Service as ServiceType, ServiceConfig, ObjectMap, DriverOptions } from '.';
import { Modules, ServiceModules, PluginModules } from 'alaska-modules';
import Config from './config';
import { NormalError } from './errors';
import Driver from './driver';

function noop() { return Promise.resolve() }

let _main: MainService;
const _mainWatcher: Array<(main: MainService) => void> = [];

export default class Service {
  static readonly classOfService = true;

  readonly instanceOfService: true;
  id: string;
  configFileName: string;
  config: Config;
  main: MainService;
  debug: Debugger.IDebugger;
  modules?: Modules;
  extensions?: {
    [id: string]: Extension;
  };
  plugins: {
    [key: string]: Plugin;
  };
  services: {
    [id: string]: ServiceType;
  };
  drivers: Set<Driver<any, any>>;
  _idleTimer?: NodeJS.Timer;
  _config: Config;
  _configWatcher: Function[];
  pre: (event: keyof ServiceType, fn: Function) => void;
  post: (event: keyof ServiceType, fn: Function) => void;

  constructor(options: ServiceOptions) {
    this.instanceOfService = true;
    this.id = options.id;
    this.configFileName = options.configFileName || options.id;
    // @ts-ignore 因为动态扩展的缘故，this 可能不满足d.ts的定义
    this.config = new Config(this);
    collie(this, 'init');
    collie(this, 'start');
    collie(this, 'ready');
    this.debug = Debugger(options.id);
    this.debug('constructor');
    this.plugins = {};
    this.services = {};
    this.drivers = new Set();
    this._configWatcher = [];
  }

  static resolveMain(): Promise<MainService> {
    if (_main) return Promise.resolve(_main);
    return new Promise((resolve) => {
      _mainWatcher.push(resolve);
    });
  }

  isMain(): boolean {
    // @ts-ignore
    return this.main === this;
  }

  createDriver(options: DriverOptions): Driver<any, any> {
    let driver: Driver<any, any>;
    if (options.recycled) {
      for (let d of this.drivers) {
        if (d.type === options.type && d.idle && _.isEqual(options, d.options)) {
          driver = d;
          break;
        }
      }
      if (driver) {
        driver.idle = null;
      }
    }
    if (!driver) {
      const DriverClass: typeof Driver = this.main.modules.libraries[options.type];
      if (!DriverClass) throw new Error(`Can not find driver ${options.type}`);
      // @ts-ignore this 和 Service 类型兼容
      driver = new DriverClass(options, this);
      if (options.recycled) {
        this.drivers.add(driver);
        if (!this._idleTimer) {
          this._idleTimer = global.setInterval(() => this._destroyIdleDrivers(), 60 * 1000);
        }
      }
    }
    return driver;
  }

  _destroyIdleDrivers() {
    // 销毁5分钟前就进入空闲的驱动
    let time = new Date(Date.now() - 5 * 60 * 1000);
    for (let d of this.drivers) {
      if (d.idle < time) {
        this.drivers.delete(d);
        d.destroy();
        break;
      }
    }
    if (!this.drivers.size) {
      global.clearInterval(this._idleTimer);
      this._idleTimer = null;
    }
  }

  async launch(modules: Modules | Promise<Modules>): Promise<void> {
    this.debug('launch');
    if (this.modules) throw new Error('Service already launched!');
    if (this.main && !this.isMain()) {
      throw new Error('Can not call launch on sub service!');
    }
    // @ts-ignore
    this.main = this;
    if (modules instanceof Promise) {
      modules = await modules;
    }
    if (this.id !== modules.id) throw new Error('MainService#id should equal package.json#name');
    // console.log('modules', modules);

    this.modules = modules;

    _main = this.main;
    while (_mainWatcher.length) {
      _mainWatcher.shift()(this.main);
    }

    let main: MainService = this.main;
    main.extensions = {};
    main.allServices = {};

    let serviceModules: ObjectMap<ServiceModules> = modules.services;

    // 遍历初始化各个Service
    _.forEach(serviceModules, (s: ServiceModules, sid: string) => {
      // console.log('ServiceModules', s);
      let service = s.service;

      // 设置主Service
      // @ts-ignore readonly
      service.main = main;

      service.config.apply(s.config);
      main.allServices[sid] = service;

      // 应用插件配置
      _.forEach(s.plugins, (p: PluginModules) => {
        if (p.config) {
          service.config.apply(p.config);
        }
      });

      // @ts-ignore
      let srv: Serivce = service;
      srv._config = service.config;
      srv._configWatcher.forEach((fn: Function) => fn(srv.config));
      srv._configWatcher = [];

      // 关联子Service
      _.forEach(service.config.get('services'), (cfg: ServiceConfig, sid: string) => {
        let sub = serviceModules[sid];
        if (!sub) return;
        service.services[sid] = sub.service;
      });
    });

    // 加载扩展库
    let extensions = _.assign({}, modules.extensions);

    const createExt = (id: string) => {
      let Ext: typeof Extension = extensions[id];
      if (!Ext) return;
      _.forEach(Ext.after, createExt);
      this.debug('new extension', id);
      let ext = new Ext(main);
      main.extensions[id] = ext;
      delete extensions[id];
    };

    _.keys(extensions).forEach(createExt);

    // 初始化、启动、就绪
    await this.init();
    await this.initPlugins();
    await this.start();
    await this.ready();
  }

  /**
   * 获取配置，并确保配置信息已经完成初始化
   * @returns {Promise<Config>}
   */
  resolveConfig(): Promise<Config> {
    if (this._config) return Promise.resolve(this._config);
    return new Promise((resolve) => {
      this._configWatcher.push(resolve);
    });
  }

  /**
   * 初始化阶段
   */
  async init(): Promise<void> {
    this.debug('init');
    this.init = noop;
    for (let id of _.keys(this.services)) {
      await this.services[id].init();
    }
  }

  /**
   * 初始化阶段
   */
  async initPlugins(): Promise<void> {
    this.debug('initPlugins');
    this.initPlugins = noop;
    for (let id of _.keys(this.services)) {
      await this.services[id].initPlugins();
    }
    _.forEach(this.main.modules.services[this.id].plugins, (plugin, key) => {
      let PluginClass: typeof Plugin = plugin.plugin;
      if (PluginClass) {
        // @ts-ignore this is Service
        this.plugins[key] = new PluginClass(this);
      }
    });
  }

  /**
   * 启动阶段
   */
  async start(): Promise<void> {
    this.debug('start');
    this.start = noop;
    for (let id of _.keys(this.services)) {
      await this.services[id].start();
    }
  }

  /**
   * 服务就绪
   */
  async ready(): Promise<void> {
    this.debug('ready');
    this.ready = noop;
    for (let id of _.keys(this.services)) {
      await this.services[id].ready();
    }
  }

  /**
   * 抛出普通异常
   * @param {string|number|Error} message
   * @param {string|number} [code]
   */
  error(message: string | number, code?: number): never {
    let msg: string;
    if (!code && typeof message === 'number') {
      msg = statuses[message];
      if (msg) {
        code = message;
      }
    } else {
      msg = String(message);
    }
    let error = new NormalError(msg);
    if (code) {
      error.code = code;
    }
    throw error;
  }
}
