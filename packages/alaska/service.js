"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Debugger = require("debug");
const collie = require("collie");
const statuses = require("statuses");
const config_1 = require("./config");
const errors_1 = require("./errors");
function noop() { return Promise.resolve(); }
let _main;
const _mainWatcher = [];
class Service {
    constructor(options) {
        this.instanceOfService = true;
        this.id = options.id;
        this.configFileName = options.configFileName || options.id;
        this.config = new config_1.default(this);
        collie(this, 'init');
        collie(this, 'start');
        collie(this, 'ready');
        this.debug = Debugger(options.id);
        this.debug('constructor');
        this.plugins = new Map();
        this.services = new Map();
        this.drivers = new Set();
        this._configWatcher = [];
    }
    static resolveMain() {
        if (_main)
            return Promise.resolve(_main);
        return new Promise((resolve) => {
            _mainWatcher.push(resolve);
        });
    }
    static lookup(id) {
        return _main.allServices.get(id) || null;
    }
    lookup(id) {
        return this.main.allServices.get(id) || null;
    }
    isMain() {
        return this.main === this;
    }
    createDriver(options) {
        let driver;
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
            const DriverClass = this.main.modules.libraries[options.type];
            if (!DriverClass)
                throw new Error(`Can not find driver ${options.type}`);
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
    async launch(modules) {
        this.debug('launch');
        if (this.modules)
            throw new Error('Service already launched!');
        if (this.main && !this.isMain()) {
            throw new Error('Can not call launch on sub service!');
        }
        this.main = this;
        if (modules instanceof Promise) {
            modules = await modules;
        }
        if (this.id !== modules.id)
            throw new Error('MainService#id should equal package.json#name');
        this.modules = modules;
        _main = this.main;
        while (_mainWatcher.length) {
            _mainWatcher.shift()(this.main);
        }
        let main = this.main;
        main.extensions = new Map();
        main.allServices = new Map();
        let serviceModules = modules.services;
        _.forEach(serviceModules, (s, sid) => {
            let service = s.service;
            service.main = main;
            service.config.apply(s.config);
            main.allServices.set(sid, service);
            _.forEach(s.plugins, (p) => {
                if (p.config) {
                    service.config.apply(p.config);
                }
            });
            let srv = service;
            srv._config = service.config;
            srv._configWatcher.forEach((fn) => fn(srv.config));
            srv._configWatcher = [];
            _.forEach(service.config.get('services'), (cfg, subSid) => {
                let sub = serviceModules[subSid];
                if (!sub)
                    return;
                service.services.set(subSid, sub.service);
            });
        });
        let extensions = _.assign({}, modules.extensions);
        const createExt = (id) => {
            let Ext = extensions[id];
            if (!Ext)
                return;
            _.forEach(Ext.after, createExt);
            this.debug('new extension', id);
            let ext = new Ext(main);
            main.extensions.set(id, ext);
            delete extensions[id];
        };
        _.keys(extensions).forEach(createExt);
        await this.init();
        await this.initPlugins();
        await this.start();
        await this.ready();
    }
    resolveConfig() {
        if (this._config)
            return Promise.resolve(this._config);
        return new Promise((resolve) => {
            this._configWatcher.push(resolve);
        });
    }
    async init() {
        this.debug('init');
        this.init = noop;
        for (let service of this.services.values()) {
            await service.init();
        }
    }
    async initPlugins() {
        this.debug('initPlugins');
        this.initPlugins = noop;
        for (let service of this.services.values()) {
            await service.initPlugins();
        }
        _.forEach(this.main.modules.services[this.id].plugins, (plugin, key) => {
            let PluginClass = plugin.plugin;
            if (PluginClass) {
                this.plugins.set(key, new PluginClass(this));
            }
        });
    }
    async start() {
        this.debug('start');
        this.start = noop;
        for (let service of this.services.values()) {
            await service.start();
        }
    }
    async ready() {
        this.debug('ready');
        this.ready = noop;
        for (let service of this.services.values()) {
            await service.ready();
        }
    }
    error(message, code) {
        let msg;
        if (!code && typeof message === 'number') {
            msg = statuses[message];
            if (msg) {
                code = message;
            }
        }
        else {
            msg = String(message);
        }
        let error = new errors_1.NormalError(msg, code);
        throw error;
    }
}
Service.classOfService = true;
exports.default = Service;
