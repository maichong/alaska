/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

//@flow

import fs from 'fs';
import Path from 'path';
import _ from 'lodash';
import { isFile, isDirectory, readJson, merge } from 'alaska/utils';
// $Flow
import defaultConfig from 'alaska/config';

function getFiles(dir: string, withExt?: boolean) {
  let result = {};
  if (isDirectory(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      if (file.endsWith('.js')) {
        let name = file.substr(0, file.length - 3);
        if (withExt) {
          result[file] = Path.join(dir, file);
        } else {
          result[name] = Path.join(dir, name);
        }
      }
    });
  }
  return result;
}

/**
 * 读取Service信息
 * @param {string} serviceDir Service目录
 * @param {string[]} enableLocales
 * @param {boolean} isMain 是主Service
 * @returns {{api, controllers, routes, models, sleds, updates}}
 */
function readService(serviceDir: string, enableLocales: string[], isMain?: boolean): Object {
  let locales = {};
  let localesDir = Path.join(serviceDir, 'locales');
  if (isDirectory(localesDir)) {
    fs.readdirSync(localesDir).forEach((locale) => {
      if (enableLocales.indexOf(locale) < 0) return;
      let file = Path.join(localesDir, locale, 'messages.js');
      if (isFile(file)) {
        locales[locale] = file;
      }
    });
  }

  let cfg = {
    api: getFiles(Path.join(serviceDir, 'api')),
    controllers: getFiles(Path.join(serviceDir, 'controllers')),
    routes: getFiles(Path.join(serviceDir, 'routes')),
    models: getFiles(Path.join(serviceDir, 'models')),
    sleds: getFiles(Path.join(serviceDir, 'sleds')),
    locales,
    updates: getFiles(Path.join(serviceDir, 'updates'), true),
    templatesDirs: [],
    reactViews: {}
  };

  let templatesDir = Path.join(serviceDir, 'templates');
  if (isDirectory(templatesDir)) {
    cfg.templatesDirs.push(templatesDir);
  } else if (isMain) {
    templatesDir = Path.join(serviceDir, '../templates');
    if (isDirectory(templatesDir)) {
      cfg.templatesDirs.push(templatesDir);
    }
  }

  let reactViewsFile = Path.join(serviceDir, 'views/react-views.js');
  if (isFile(reactViewsFile)) {
    // $Flow
    let views = require(reactViewsFile).default || [];
    cfg.reactViews = views.reduce((res, view) => {
      res[view] = Path.join(serviceDir, 'views', view);
      return res;
    }, {});
  }

  return cfg;
}

/**
 * 读取插件详细信息
 * @param {string} pluginDir
 * @param {string[]} enableLocales
 */
function readPlugin(pluginDir: string, enableLocales: string[]) {
  if (pluginDir.endsWith('.js') && isFile(pluginDir)) {
    return {
      dir: pluginDir,
      config: pluginDir
    };
  }

  let locales = {};
  let localesDir = Path.join(pluginDir, 'locales');
  if (isDirectory(localesDir)) {
    fs.readdirSync(localesDir).forEach((locale) => {
      if (enableLocales.indexOf(locale) < 0) return;
      let file = Path.join(localesDir, locale, 'messages.js');
      if (isFile(file)) {
        locales[locale] = file;
      }
    });
  }

  let classFile = Path.join(pluginDir, 'index.js');
  if (!isFile(classFile)) {
    classFile = '';
  }

  let res = {
    dir: pluginDir,
    config: '',
    pluginClass: classFile,
    api: getFiles(Path.join(pluginDir, 'api')),
    controllers: getFiles(Path.join(pluginDir, 'controllers')),
    routes: getFiles(Path.join(pluginDir, 'routes')),
    models: getFiles(Path.join(pluginDir, 'models')),
    sleds: getFiles(Path.join(pluginDir, 'sleds')),
    locales,
  };

  let configFile = Path.join(pluginDir, 'config.js');
  if (isFile(configFile)) {
    res.config = configFile;
  }

  return res;
}

/**
 * 确定插件的绝对路径
 * @param {Object} config 配置
 * @param {string} file 配置文件路径
 * @param {string[]} mdirs 模块目录列表
 */
function resolvePluginPath(config: Object, file: string, mdirs: string[]) {
  if (_.size(config.plugins)) {
    config.plugins = _.reduce(config.plugins, (res: Object, p: string, k: string) => {
      if (!Path.isAbsolute(p)) {
        if (p[0] === '.') {
          p = Path.join(file, p);
        } else {
          for (let dir of mdirs) {
            p = Path.join(dir, p);
            if (isDirectory(p)) {
              break;
            }
          }
        }
      }
      res[k] = p;
      return res;
    }, {});
  }
}

export default function createMetadata(id: string, dir: string, mainConfigFileName: string, modulesDirs?: string[]) {
  let mdirs: string[] = modulesDirs || ['node_modules'];
  if (mdirs.indexOf('node_modules') < 0) {
    mdirs.push('node_modules');
  }

  mdirs = mdirs.map((d) => {
    if (Path.isAbsolute(d)) {
      return d;
    }
    return Path.join(process.cwd(), d);
  });

  let metadata = {
    fields: {},
    drivers: {},
    renderers: {},
    middlewares: {},
    services: {},
    locales: []
  };

  let mainConfigDir = Path.join(dir, 'config');
  let mainConfigFilePath = Path.join(mainConfigDir, mainConfigFileName);
  // $Flow
  let mainConfig = require(mainConfigFilePath).default;

  resolvePluginPath(mainConfig, mainConfigFilePath, mdirs);

  // 各个Service的配置信息
  let configs = {
    [id]: mainConfig
  };

  // 各个Service插件列表
  let plugins = {};

  metadata.locales = mainConfig.locales || defaultConfig.locales || ['en', 'zh-CN'];
  let defaultLocale = mainConfig.defaultLocale || defaultConfig.defaultLocale;
  if (defaultLocale && metadata.locales.indexOf(defaultLocale) < 0) {
    metadata.locales.push(defaultLocale);
  }

  // 读取主Service信息
  metadata.services[id] = {
    main: true,
    dir,
    config: mainConfigFilePath,
    ...readService(dir, metadata.locales, true)
  };

  // 递归遍历Service
  function readServices(services, configFilePath) {
    _.forEach(services, (init, serviceId) => {
      if (_.isPlainObject(metadata.services[serviceId])) return;
      // $Flow
      let serviceDir = init.dir;
      if (!serviceDir) {
        for (let d of mdirs) {
          serviceDir = Path.join(d, serviceId);
          if (isDirectory(serviceDir)) {
            break;
          }
        }
      } else if (!Path.isAbsolute(serviceDir)) {
        serviceDir = Path.join(Path.dirname(configFilePath), serviceDir);
      }
      if (!isDirectory(serviceDir)) {
        if (init.optional) {
          return;
        }
        throw new Error(`Service '${serviceId}' not found!`);
      }
      let cfg = {
        id: serviceId,
        dir: serviceDir,
        config: '',
        ...readService(serviceDir, metadata.locales)
      };
      metadata.services[serviceId] = cfg;

      let serviceConfigFile = Path.join(serviceDir, 'config', serviceId + '.js');
      if (isFile(serviceConfigFile)) {
        cfg.config = serviceConfigFile;
        // $Flow
        let serviceConfig = require(serviceConfigFile).default;
        resolvePluginPath(serviceConfig, serviceConfigFile, mdirs);
        configs[serviceId] = serviceConfig;
        readServices(serviceConfig.services || {}, serviceConfigFile);
      } else {
        configs[serviceId] = {};
      }
    });
  }

  readServices(mainConfig.services, mainConfigFilePath);

  // 读取node_modules目录，解析所有package.json
  mdirs.forEach((mdir) => {
    fs.readdirSync(mdir).forEach((lib) => {
      if (lib[0] === '.') return;
      // $Flow
      let pkgPath = Path.join(mdir, lib, 'package.json');
      if (isFile(pkgPath)) {
        let json = readJson(pkgPath);
        // $Flow
        let requirePath = Path.join(mdir, lib);
        switch (json.alaska) {
          case 'driver':
            metadata.drivers[json.name] = requirePath;
            break;
          case 'field':
            metadata.fields[json.name] = requirePath;
            break;
          case 'renderer':
            metadata.renderers[json.name] = requirePath;
            break;
          default:
        }
      }
    });
  });

  // 加载子Service配置
  _.forEachRight(metadata.services, (service, serviceId) => {
    let configDir = Path.join(service.dir, 'config');
    // 遍历配置目录，寻找子Service配置
    fs.readdirSync(configDir).forEach((name) => {
      if (name[0] === '.') return;
      if (name === serviceId + '.js') return; // 此文件是当前Service配置，不是子Service配置
      let path = Path.join(configDir, name);
      if (name.endsWith('.js')) {
        name = name.substr(0, name.length - 3);
      }
      if (!_.isPlainObject(metadata.services[name])) return; // 没有依赖此子Service
      // 检查依赖
      let serviceConfig = configs[serviceId];
      if (!serviceConfig) return; // 项目没有安装当前子Service
      if (!_.isPlainObject(serviceConfig.services[name])) return;
      if (!plugins[name]) {
        plugins[name] = {};
      }
      let pluginRelative = Path.relative(dir, path);
      plugins[name][pluginRelative] = path;
      let pluginConfigFile = path;
      if (!path.endsWith('.js')) {
        pluginConfigFile = Path.join(configDir, name, 'config.js');
      }
      if (isFile(pluginConfigFile)) {
        // $Flow
        let pluginConfig = require(pluginConfigFile).default;
        resolvePluginPath(pluginConfig, pluginConfigFile, mdirs);
        configs[name] = merge(configs[name], pluginConfig);
      }
    });
  });

  // 加载插件配置
  _.forEach(configs, (config, serviceId) => {
    if (!_.size(config.plugins)) return;
    _.forEach(config.plugins, (path, key) => {
      if (!plugins[serviceId]) {
        plugins[serviceId] = {};
      }
      if (!plugins[serviceId].hasOwnProperty(key)) {
        plugins[serviceId][key] = path;
      }
    });
  });

  _.forEach(metadata.services, (service, serviceId) => {
    service.plugins = _.reduce(plugins[serviceId], (res, pluginDir, key) => {
      let templatesDir = Path.join(pluginDir, 'templates');
      if (isDirectory(templatesDir)) {
        service.templatesDirs.push(templatesDir);
      }
      res[key] = readPlugin(pluginDir, metadata.locales);
      return res;
    }, {});
  });

  // 读取app中间件
  _.forEach(configs, (cfg) => {
    _.forEach(cfg.middlewares, (item, middlewareId) => {
      if (!item || item.fn) return;
      middlewareId = item.id || middlewareId;
      // $Flow
      let middlewarePath = middlewareId;
      if (!Path.isAbsolute(middlewarePath)) {
        for (let d of mdirs) {
          middlewarePath = Path.join(d, middlewareId);
          if (isDirectory(middlewarePath)) {
            break;
          }
        }
      }
      metadata.middlewares[middlewareId] = middlewarePath;
    });
  });

  return metadata;
}
