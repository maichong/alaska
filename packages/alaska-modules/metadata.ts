import * as _ from 'lodash';
import * as collie from 'collie';
import * as fs from 'fs';
import * as Path from 'path';
import * as isDirectory from 'is-directory';
import { ConfigData, Loader as LoaderClass, Config, ServiceConfig, PluginConfig } from 'alaska';
import { Modules, LibraryMetadata, ExtensionMetadata, ServiceMetadata, PluginMetadata } from 'alaska-modules';
import { ModuleTree, ModulePath, Module, ModuleType } from './tree';
import debug from './debug';

/**
 * 创建项目模块信息
 * @param {string} id 主Service id
 * @param {string} dir 主Service目录
 * @param {string} configFileName 配置文件名
 * @param {string[]} modulesDirs 可选的 node_modules 目录列表
 */
export default function createMetadata(id: string, dir: string, configFileName: string, modulesDirs?: string[]): ModulesMetadata {
  debug('createMetadata');
  const metadata = new ModulesMetadata(id, dir, configFileName, modulesDirs);

  return metadata;
}

class ModulesMetadata {
  id: string;
  dir: string;
  configFileName: string;
  modulesDirs: string[];
  config: ConfigData;
  main: ServiceMetadata;
  libraries: {
    [id: string]: LibraryMetadata;
  };
  extensions: {
    [id: string]: ExtensionMetadata;
  };
  services: {
    [id: string]: ServiceMetadata;
  };
  allServices: string[];
  pre: (event: string, fn: Function) => void;
  post: (event: string, fn: Function) => void;

  constructor(id: string, dir: string, configFileName: string, modulesDirs?: string[]) {
    this.id = id;
    this.dir = dir;
    this.configFileName = configFileName;
    this.modulesDirs = modulesDirs || ['node_modules'];
    this.config = _.cloneDeep(Config.defaultConfig);
    this.libraries = {};
    this.extensions = {};
    this.services = {};
    this.allServices = [];
    this.main = {
      id,
      path: '',
      configFile: Path.join(dir, 'config', configFileName),
      config: this.config,
      loadConfig: { dir },
      dismiss: false,
      plugins: {}
    };
    collie(this, 'load');
    collie(this, 'loadConfig');
    collie(this, 'loadExtensions');
    collie(this, 'loadExtension');
    collie(this, 'loadServices');
    collie(this, 'loadService');
    collie(this, 'loadPlugins');
    collie(this, 'loadSubServicePlugins');
    collie(this, 'loadServiceConfigPlugins');
    collie(this, 'loadServicePlugin');
    collie(this, 'loadLibraries');
    collie(this, 'loadLibrary');
    collie(this, 'build');
    collie(this, 'buildExtension');
    collie(this, 'buildService');
    collie(this, 'buildPlugin');
    collie(this, 'buildLibrary');
  }

  getRelativePath(path: string): string {
    let cwd = process.cwd();
    let nodeModulesDir = Path.join(cwd, 'node_modules');
    let p = Path.relative(nodeModulesDir, path);
    if (p[0] !== '.') {
      return p;
    }
    p = Path.relative(this.dir, path);
    if (p[0] !== '.') {
      p = `./${p}`;
    }
    return p;
  }

  async load() {
    debug('load');
    await this.loadConfig();
    await this.loadExtensions();
    await this.loadServices();
    await this.loadPlugins();
    await this.loadLibraries();
  }

  /**
   * 加载配置文件
   */
  async loadConfig() {
    debug('loadConfig');
    let configFile = Path.join(this.dir, 'config', this.configFileName);
    Config.applyData(this.config, require(configFile).default);
  }

  /**
   * 加载功能扩展
   */
  async loadExtensions() {
    debug('loadExtensions');
    for (let extId of _.keys(this.config.extensions)) {
      let extConfig = this.config.extensions[extId];
      let meta: ExtensionMetadata = {
        id: extId,
        path: '',
        loader: null,
        dismiss: false
      };
      await this.loadExtension(meta, extConfig);
    }
  }

  async loadExtension(meta: ExtensionMetadata, extConfig: Object) {
    if (meta.dismiss) {
      return;
    }
    if (!_.find(this.modulesDirs.concat([this.configFileName]), (mDir) => {
      let path = Path.join(process.cwd(), mDir, meta.id);
      if (!isDirectory.sync(path)) return false;
      // 找到了扩展目录
      meta.path = path;
      return true;
    })) {
      throw new Error(`Can not load extension ${meta.id}`);
    }

    this.extensions[meta.id] = meta;

    debug(`extension create loader: ${meta.id}`);
    const Loader: typeof LoaderClass = require(Path.join(meta.path, 'loader')).default;
    // @ts-ignore 忽略：插件扩展后导致 this 类型不兼容
    meta.loader = new Loader(this, extConfig);
  }

  /**
   * 加载Service
   */
  async loadServices() {
    debug('loadServices');

    _.forEach(this.config.services, (loadConfig: ServiceConfig, sid: string) => {
      if (this.allServices.indexOf(sid) === -1) {
        this.allServices.push(sid);
      }
    });

    // 从主Service开始，递归加载子Service
    await this.loadService(this.main);
  }

  async loadService(meta: ServiceMetadata) {
    if (meta.dismiss) {
      return;
    }
    debug(`load service: ${meta.id}`);
    if (!meta.path) {
      if (meta.loadConfig.dir) {
        if (Path.isAbsolute(meta.loadConfig.dir)) {
          meta.path = meta.loadConfig.dir;
        } else {
          meta.path = Path.join(this.dir, 'config/', meta.loadConfig.dir);
        }
      } else {
        _.find(this.modulesDirs, (dir) => {
          let path = Path.join(process.cwd(), dir, meta.id);
          if (!isDirectory.sync(path)) return false;
          meta.path = path;
          return true;
        });
      }
    }
    if (!meta.path) throw new Error(`Service not found: ${meta.id}`);
    if (!isDirectory.sync(meta.path)) throw new Error(`Service not exists: ${meta.id}, ${meta.path}`);
    if (!meta.configFile) {
      meta.configFile = Path.join(meta.path, 'config', meta.id);
    }
    if (!meta.config) {
      let config = require(meta.configFile).default;
      debug(`${meta.id} base config`, config);
      meta.config = Config.applyData(_.cloneDeep(Config.defaultConfig), config);
    }

    this.services[meta.id] = meta;

    let loaderFile = Path.join(meta.path, 'loader');
    if (fs.existsSync(`${loaderFile}.ts`) || fs.existsSync(`${loaderFile}.js`)) {
      debug(`service create loader: ${meta.id}`);
      const Loader: typeof LoaderClass = require(loaderFile).default;
      // @ts-ignore 忽略：插件扩展后导致 this 类型不兼容
      meta.loader = new Loader(this, {});
    }

    _.forEach(meta.config.services, (loadConfig: ServiceConfig, sid: string) => {
      if (loadConfig.optional) return;
      if (this.allServices.indexOf(sid) === -1) {
        this.allServices.push(sid);
      }
    });

    // 加载各个子Service
    for (let sid of _.keys(meta.config.services)) {
      if (this.services[sid]) continue;
      let sConfig = meta.config.services[sid];
      // 可选Service
      if (sConfig.optional && this.allServices.indexOf(sid) === -1) continue;
      await this.loadService({
        id: sid,
        path: '',
        configFile: '',
        config: null,
        loadConfig: sConfig,
        dismiss: false,
        plugins: {}
      });
    }
  }

  /**
   * 加载插件
   */
  async loadPlugins() {
    debug('loadPlugins');
    await this.loadSubServicePlugins(this.main);
    await this.loadServiceConfigPlugins(this.main);
  }

  /**
   * 为子Service加载插件，A类插件
   * @param service
   */
  async loadSubServicePlugins(service: ServiceMetadata) {
    debug('loadSubServicePlugins', service.id);
    if (!service.config.services) return;

    // 先为子Service加载插件
    for (let sid of _.keys(service.config.services)) {
      let sub: ServiceMetadata = this.services[sid];
      if (!sub || sub.dismiss) continue;
      if (sub.loadedSubServicePlugins) continue;
      sub.loadedSubServicePlugins = true;
      await this.loadSubServicePlugins(sub);
    }

    // 查询当前Service的plugins目录，加载插件
    for (let sid of _.keys(service.config.services)) {
      let sub: ServiceMetadata = this.services[sid];
      if (!sub || sub.dismiss) continue;
      // load
      let pluginDir = Path.join(service.path, 'plugins', sub.id);
      if (!isDirectory.sync(pluginDir)) continue;
      let id = this.getRelativePath(pluginDir);
      if (sub.plugins[id]) continue;
      let meta: PluginMetadata = {
        id,
        path: pluginDir,
        dismiss: false
      };
      await this.loadServicePlugin(sub, meta);
      if (!meta.dismiss) {
        sub.plugins[id] = meta;
      }
    }

    // 如果为开发模式，警告无用的 plugins/xx 目录
    if (process.env.NODE_ENV === 'development') {
      let pluginsDir = Path.join(service.path, 'plugins');
      if (!isDirectory.sync(pluginsDir)) return;
      fs.readdirSync(pluginsDir).forEach((name) => {
        if (name[0] === '.') return;
        if (service.config.services[name]) return;
        console.warn(`WARN: Sub service not found for plugin ${Path.relative(process.cwd(), Path.join(pluginsDir, name))}`);
      });
    }
  }

  /**
   * 加载当前Service配置中指定的插件，B类插件
   * @param service
   */
  async loadServiceConfigPlugins(service: ServiceMetadata) {
    debug('loadServiceConfigPlugins', service.id);
    if (service.config.services) {
      // 递归调用子Service
      for (let sid of _.keys(service.config.services)) {
        let sub: ServiceMetadata = this.services[sid];
        if (!sub || sub.dismiss) continue;
        if (sub.loadedServiceConfigPlugins) continue;
        sub.loadedServiceConfigPlugins = true;
        await this.loadServiceConfigPlugins(sub);
      }
    }

    // 加载当前Service Plugins
    for (let key of _.keys(service.config.plugins)) {
      let pluginConfig: PluginConfig = service.config.plugins[key];
      let dir = pluginConfig.dir;
      if (dir) {
        dir = Path.join(service.path, 'config', dir);
      } else {
        _.find(this.modulesDirs, (mDir) => {
          let path = Path.join(process.cwd(), mDir, key);
          if (isDirectory.sync(path)) {
            dir = path;
            return true;
          }
          return false;
        });
      }
      if (!dir) {
        throw new Error(`Can not find plugin "${key}" for service “${service.id}”`);
      }
      let id = this.getRelativePath(dir);
      if (service.plugins[dir]) continue;
      let meta: PluginMetadata = {
        id,
        path: dir,
        dismiss: false
      };
      await this.loadServicePlugin(service, meta);
      if (!meta.dismiss) {
        service.plugins[dir] = meta;
      }
    }
  }

  /**
   * 为指定Service加载指定Plugin
   */
  async loadServicePlugin(service: ServiceMetadata, plugin: PluginMetadata) {
    debug('loadServicePlugin', service.id, plugin.path + (plugin.dismiss ? ' dismissed' : ''));
    if (plugin.dismiss) return;
    if (!plugin.plugin) {
      let files = fs.readdirSync(plugin.path);
      if (files.indexOf('index.js') > -1 || files.indexOf('index.ts') > -1) {
        plugin.plugin = plugin.path;
      }
    }
    // 如果前置钩子中已经设置了配置文件，允许前置钩子动态修改配置文件路径
    if (!plugin.configFile) {
      let configPath = Path.join(plugin.path, 'config');
      try {
        let config = require(configPath).default;
        plugin.configFile = configPath;
        plugin.config = config;
        Config.applyData(service.config, config);
      } catch (e) {
        // Plugin config file not found
      }
    }
  }

  /**
   * 加载动态库
   */
  async loadLibraries() {
    debug('loadLibraries');

    let libraries = this.config.libraries || [];

    for (let mDir of this.modulesDirs) {
      for (let lib of fs.readdirSync(mDir)) {
        if (lib[0] === '.') continue;
        if (libraries.indexOf(lib) > -1) {
          let meta: LibraryMetadata = {
            id: lib,
            path: Path.join(process.cwd(), mDir, lib),
            type: '',
            dismiss: false
          };
          await this.loadLibrary(meta);
          continue;
        }
        try {
          let pkgPath = Path.join(mDir, lib, 'package.json');
          let content = fs.readFileSync(pkgPath, 'utf8');
          let json = JSON.parse(content);

          if (json.alaska && ['core', 'extension', 'service', 'view', 'cli'].indexOf(json.alaska) === -1) {
            let meta: LibraryMetadata = {
              id: lib,
              path: Path.join(process.cwd(), mDir, lib),
              type: json.alaska,
              dismiss: false
            };
            await this.loadLibrary(meta);
          }
        } catch (e) { }
      }
    }
  }

  async loadLibrary(meta: LibraryMetadata) {
    if (meta.dismiss) return;
    debug('loadLibrary', meta.id);
    this.libraries[meta.id] = meta;
  }

  async build(): Promise<ModuleTree> {
    debug('build');
    let tree = new ModuleTree();
    tree.id = this.id;
    tree.libraries = new ModuleTree();
    tree.extensions = new ModuleTree();
    tree.services = new ModuleTree();

    for (let id of _.keys(this.libraries)) {
      let meta = this.libraries[id];
      if (meta.dismiss) continue;
      await this.buildLibrary(meta, tree);
    }

    for (let id of _.keys(this.extensions)) {
      let meta = this.extensions[id];
      if (meta.dismiss) continue;
      await this.buildExtension(meta, tree);
    }

    for (let id of _.keys(this.services)) {
      let meta = this.services[id];
      if (meta.dismiss) continue;
      let service = new ModuleTree();
      service.id = id;
      tree.services[id] = service;
      await this.buildService(meta, tree);
    }

    // debug('modules tree', JSON.stringify(tree, null, 2));
    return tree;
  }

  async buildLibrary(meta: LibraryMetadata, tree: ModuleTree) {
    if (meta.dismiss) return;
    // @ts-ignore libraries 一定存在
    let libraries: ModuleTree = tree.libraries;
    libraries[meta.id] = new Module(meta.path, 'ESModule');
  }

  async buildExtension(meta: ExtensionMetadata, tree: ModuleTree) {
    if (meta.dismiss) return;
    // @ts-ignore libraries 一定存在
    let extensions: ModuleTree = tree.extensions;
    extensions[meta.id] = new Module(meta.path, 'ESModule');
  }

  async buildService(meta: ServiceMetadata, tree: ModuleTree) {
    if (meta.dismiss) return;
    // @ts-ignore services 一定存在
    let service: ModuleTree = tree.services[meta.id];
    service.config = new Module(meta.configFile, 'ESModule');
    service.service = new Module(meta.path, 'ESModule');
    let plugins = new ModuleTree();
    service.plugins = plugins;
    for (let id of _.keys(meta.plugins)) {
      let pluginMeta = meta.plugins[id];
      if (pluginMeta.dismiss) continue;
      let plugin = new ModuleTree();
      plugins[id] = plugin;
      await this.buildPlugin(meta, tree, pluginMeta, plugin);
    }
  }

  async buildPlugin(service: ServiceMetadata, tree: ModuleTree, pluginMeta: PluginMetadata, plugin: ModuleTree) {
    plugin.id = pluginMeta.id;
    if (!plugin.plugin && pluginMeta.plugin) {
      plugin.plugin = new Module(pluginMeta.plugin, 'ESModule');
    }
    if (!plugin.config && pluginMeta.configFile) {
      plugin.config = new Module(pluginMeta.configFile, 'ESModule');
    }
    // console.log('build plugin', pluginMeta, plugin);
  }


  /**
   * 转换为Modules对象输出
   */
  async toModules(): Promise<Modules> {
    await this.load();

    function convent(value: any): any {
      if (value instanceof Module) {
        let lib = require(value.path);
        if (value.type !== 'CommonJs' && lib && lib.default) {
          lib = lib.default;
        }
        return lib;
      } else if (value instanceof ModulePath) {
        // module path
        return Path.resolve(this.dir, value.path);
      } else if (Array.isArray(value)) {
        return value.map(convent);
      } else if (value && typeof value === 'object') {
        // ModuleTree
        let result: any = {};
        for (let key of _.keys(value)) {
          result[key] = convent(value[key]);
        }
        return result;
      }
      return value;
    }
    let modules = convent(await this.build());
    // debug('modules', modules);
    return modules;
  }

  /**
   * 转换为modules.js文件输出
   */
  async toScript(): Promise<string> {
    await this.load();

    const requirePath = (path: string, type: ModuleType): string => {
      let str = `require('${this.getRelativePath(path)}')`;
      if (type !== 'CommonJs') {
        str = `importDefault(${str})`;
      }
      return str;
    };

    function convent(value: any): string {
      if (value instanceof Module) {
        return requirePath(value.path, value.type);
      } else if (value instanceof ModulePath) {
        // module path
        return Path.resolve(this.dir, value.path);
      } else if (Array.isArray(value)) {
        return `[\n${value.map(convent).join(',\n')}]`;
      } else if (value && typeof value === 'object') {
        // ModuleTree
        let result = '{\n';
        for (let key of _.keys(value)) {
          let k = key;
          if (/[-\.\/\\]/.test(k)) {
            k = `'${k}'`;
          }
          result += `  ${k}: ${convent(value[key])},\n`;
        }
        return `${result}}`;
      }
      return JSON.stringify(value);
    }

    let script = [
      'Object.defineProperty(exports, "__esModule", { value: true });',
      'function importDefault(lib){return lib && typeof lib==="object" && lib.default!==undefined?lib.default:lib}',
      'module.exports.default = '
    ].join('\n');
    return script + convent(await this.build());
  }
}
