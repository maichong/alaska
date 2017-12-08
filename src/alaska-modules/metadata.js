/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-11-21
 * @author Liang <liang@maichong.it>
 */

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import fs from 'fs';
import Path from 'path';
import _ from 'lodash';
import { isFile, isDirectory, readJson, merge } from 'alaska/utils';
import defaultConfig from 'alaska/config';

const modulesDir = Path.join(process.cwd(), 'node_modules');

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
 * @param {boolean} isMain 是主Service
 * @returns {{api, controllers, routes, models, sleds, updates}}
 */
function readService(serviceDir: string, isMain?: boolean): Object {
  let locales = {};
  let localesDir = Path.join(serviceDir, 'locales');
  if (isDirectory(localesDir)) {
    fs.readdirSync(localesDir).forEach((locale) => {
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
    templatesDirs: []
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

  return cfg;
}

/**
 * 读取插件详细信息
 * @param {string} pluginDir
 */
function readPlugin(pluginDir: string) {
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
 */
function resolvePluginPath(config, file) {
  if (_.size(config.plugins)) {
    config.plugins = _.map(config.plugins, (p) => {
      if (Path.isAbsolute(p)) return p;
      if (p[0] === '.') {
        p = Path.join(file, p);
      } else {
        p = Path.join(modulesDir, p);
      }
      return p;
    });
  }
}

export default function createMetadata(id: string, dir: string, mainConfigFile: string) {
  let metadata = {
    fields: {},
    drivers: {},
    renderers: {},
    middlewares: {},
    services: {},
    locales: []
  };

  let mainConfigDir = Path.join(dir, 'config');
  let mainConfigFilePath = Path.join(mainConfigDir, mainConfigFile);
  let mainConfig = require(mainConfigFilePath).default;

  resolvePluginPath(mainConfig, mainConfigFilePath);

  // 各个Service的配置信息
  let configs = {
    [id]: mainConfig
  };

  // 各个Service插件列表
  let plugins = {};

  // 读取主Service信息
  metadata.services[id] = {
    main: true,
    dir,
    config: mainConfigFilePath,
    ...readService(dir, true)
  };

  // 递归遍历Service
  function readServices(services) {
    _.forEach(services, (init, serviceId) => {
      if (_.isPlainObject(metadata.services[serviceId])) return;
      let serviceDir = init.dir || Path.join(modulesDir, serviceId);
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
        ...readService(serviceDir)
      };
      metadata.services[serviceId] = cfg;

      let serviceConfigFile = Path.join(serviceDir, 'config', serviceId + '.js');
      if (isFile(serviceConfigFile)) {
        cfg.config = serviceConfigFile;
        let serviceConfig = require(serviceConfigFile).default;
        resolvePluginPath(serviceConfig, serviceConfigFile);
        configs[serviceId] = serviceConfig;
        readServices(serviceConfig.services || {});
      } else {
        configs[serviceId] = {};
      }
    });
  }

  readServices(mainConfig.services);

  // 读取node_modules目录，解析所有package.json
  fs.readdirSync(modulesDir).forEach((lib) => {
    if (lib[0] === '.') return;
    let pkgPath = Path.join(modulesDir, lib, 'package.json');
    if (isFile(pkgPath)) {
      let json = readJson(pkgPath);
      switch (json.alaska) {
        case 'driver':
          metadata.drivers[json.name] = json.name;
          break;
        case 'field':
          metadata.fields[json.name] = json.name;
          break;
        case 'renderer':
          metadata.renderers[json.name] = json.name;
          break;
        default:
      }
    }
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
        plugins[name] = [];
      }
      plugins[name].push(path);
      let pluginConfigFile = path;
      if (!path.endsWith('.js')) {
        pluginConfigFile = Path.join(configDir, name, 'config.js');
      }
      if (isFile(pluginConfigFile)) {
        let pluginConfig = require(pluginConfigFile).default;
        resolvePluginPath(pluginConfig, pluginConfigFile);
        configs[name] = merge(configs[name], pluginConfig);
      }
    });
  });

  // 加载插件配置
  _.forEach(configs, (config, serviceId) => {
    if (!_.size(config.plugins)) return;
    _.forEach(config.plugins, (path) => {
      if (!plugins[serviceId]) {
        plugins[serviceId] = [];
      }
      if (plugins[serviceId].indexOf(path) === -1) {
        plugins[serviceId].push(path);
      }
    });
  });

  _.forEach(metadata.services, (service, serviceId) => {
    service.plugins = _.map(plugins[serviceId], (pluginDir) => {
      let templatesDir = Path.join(pluginDir, 'templates');
      if (isDirectory(templatesDir)) {
        service.templatesDirs.push(templatesDir);
      }
      return readPlugin(pluginDir);
    });
  });

  metadata.locales = configs[id].locales || defaultConfig.locales || [];
  let defaultLocale = configs[id].defaultLocale || defaultConfig.defaultLocale;
  if (metadata.locales.indexOf(defaultLocale) < 0) {
    metadata.locales.push(defaultLocale);
  }

  // 读取app中间件
  _.forEach(configs, (cfg) => {
    _.forEach(cfg.middlewares, (item, middlewareId) => {
      if (!item || item.fn) return;
      middlewareId = item.id || middlewareId;
      metadata.middlewares[middlewareId] = middlewareId;
    });
  });

  return metadata;
}
