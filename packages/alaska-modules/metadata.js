'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * @copyright Maichong Software Ltd. 2017 http://maichong.it
                                                                                                                                                                                                                                                                   * @date 2017-11-21
                                                                                                                                                                                                                                                                   * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                   */

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

exports.default = createMetadata;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('alaska/utils');

var _config = require('alaska/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const modulesDir = _path2.default.join(process.cwd(), 'node_modules');

function getFiles(dir, withExt) {
  let result = {};
  if ((0, _utils.isDirectory)(dir)) {
    _fs2.default.readdirSync(dir).forEach(file => {
      if (file.endsWith('.js')) {
        let name = file.substr(0, file.length - 3);
        if (withExt) {
          result[file] = _path2.default.join(dir, file);
        } else {
          result[name] = _path2.default.join(dir, name);
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
function readService(serviceDir, enableLocales, isMain) {
  let locales = {};
  let localesDir = _path2.default.join(serviceDir, 'locales');
  if ((0, _utils.isDirectory)(localesDir)) {
    _fs2.default.readdirSync(localesDir).forEach(locale => {
      if (enableLocales.indexOf(locale) < 0) return;
      let file = _path2.default.join(localesDir, locale, 'messages.js');
      if ((0, _utils.isFile)(file)) {
        locales[locale] = file;
      }
    });
  }

  let cfg = {
    api: getFiles(_path2.default.join(serviceDir, 'api')),
    controllers: getFiles(_path2.default.join(serviceDir, 'controllers')),
    routes: getFiles(_path2.default.join(serviceDir, 'routes')),
    models: getFiles(_path2.default.join(serviceDir, 'models')),
    sleds: getFiles(_path2.default.join(serviceDir, 'sleds')),
    locales,
    updates: getFiles(_path2.default.join(serviceDir, 'updates'), true),
    templatesDirs: [],
    reactViews: {}
  };

  let templatesDir = _path2.default.join(serviceDir, 'templates');
  if ((0, _utils.isDirectory)(templatesDir)) {
    cfg.templatesDirs.push(templatesDir);
  } else if (isMain) {
    templatesDir = _path2.default.join(serviceDir, '../templates');
    if ((0, _utils.isDirectory)(templatesDir)) {
      cfg.templatesDirs.push(templatesDir);
    }
  }

  let reactViewsFile = _path2.default.join(serviceDir, 'views/react-views.js');
  if ((0, _utils.isFile)(reactViewsFile)) {
    let views = require(reactViewsFile).default || [];
    cfg.reactViews = views.reduce((res, view) => {
      res[view] = _path2.default.join(serviceDir, 'views', view);
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
function readPlugin(pluginDir, enableLocales) {
  if (pluginDir.endsWith('.js') && (0, _utils.isFile)(pluginDir)) {
    return {
      dir: pluginDir,
      config: pluginDir
    };
  }

  let locales = {};
  let localesDir = _path2.default.join(pluginDir, 'locales');
  if ((0, _utils.isDirectory)(localesDir)) {
    _fs2.default.readdirSync(localesDir).forEach(locale => {
      if (enableLocales.indexOf(locale) < 0) return;
      let file = _path2.default.join(localesDir, locale, 'messages.js');
      if ((0, _utils.isFile)(file)) {
        locales[locale] = file;
      }
    });
  }

  let classFile = _path2.default.join(pluginDir, 'index.js');
  if (!(0, _utils.isFile)(classFile)) {
    classFile = '';
  }

  let res = {
    dir: pluginDir,
    pluginClass: classFile,
    api: getFiles(_path2.default.join(pluginDir, 'api')),
    controllers: getFiles(_path2.default.join(pluginDir, 'controllers')),
    routes: getFiles(_path2.default.join(pluginDir, 'routes')),
    models: getFiles(_path2.default.join(pluginDir, 'models')),
    sleds: getFiles(_path2.default.join(pluginDir, 'sleds')),
    locales
  };

  let configFile = _path2.default.join(pluginDir, 'config.js');
  if ((0, _utils.isFile)(configFile)) {
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
  if (_lodash2.default.size(config.plugins)) {
    config.plugins = _lodash2.default.reduce(config.plugins, (res, p, k) => {
      if (!_path2.default.isAbsolute(p)) {
        if (p[0] === '.') {
          p = _path2.default.join(file, p);
        } else {
          p = _path2.default.join(modulesDir, p);
        }
      }
      res[k] = p;
      return res;
    }, {});
  }
}

function createMetadata(id, dir, mainConfigFile) {
  let metadata = {
    fields: {},
    drivers: {},
    renderers: {},
    middlewares: {},
    services: {},
    locales: []
  };

  let mainConfigDir = _path2.default.join(dir, 'config');
  let mainConfigFilePath = _path2.default.join(mainConfigDir, mainConfigFile);
  let mainConfig = require(mainConfigFilePath).default;

  resolvePluginPath(mainConfig, mainConfigFilePath);

  // 各个Service的配置信息
  let configs = {
    [id]: mainConfig
  };

  // 各个Service插件列表
  let plugins = {};

  // 读取主Service信息
  metadata.services[id] = _extends({
    main: true,
    dir,
    config: mainConfigFilePath
  }, readService(dir, metadata.locales, true));

  metadata.locales = mainConfig.locales || _config2.default.locales || ['en', 'zh-CN'];
  let defaultLocale = mainConfig.defaultLocale || _config2.default.defaultLocale;
  if (defaultLocale && metadata.locales.indexOf(defaultLocale) < 0) {
    metadata.locales.push(defaultLocale);
  }

  // 递归遍历Service
  function readServices(services) {
    _lodash2.default.forEach(services, (init, serviceId) => {
      if (_lodash2.default.isPlainObject(metadata.services[serviceId])) return;
      let serviceDir = init.dir || _path2.default.join(modulesDir, serviceId);
      if (!(0, _utils.isDirectory)(serviceDir)) {
        if (init.optional) {
          return;
        }
        throw new Error(`Service '${serviceId}' not found!`);
      }
      let cfg = _extends({
        id: serviceId,
        dir: serviceDir,
        config: ''
      }, readService(serviceDir, metadata.locales));
      metadata.services[serviceId] = cfg;

      let serviceConfigFile = _path2.default.join(serviceDir, 'config', serviceId + '.js');
      if ((0, _utils.isFile)(serviceConfigFile)) {
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
  _fs2.default.readdirSync(modulesDir).forEach(lib => {
    if (lib[0] === '.') return;
    let pkgPath = _path2.default.join(modulesDir, lib, 'package.json');
    if ((0, _utils.isFile)(pkgPath)) {
      let json = (0, _utils.readJson)(pkgPath);
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
  _lodash2.default.forEachRight(metadata.services, (service, serviceId) => {
    let configDir = _path2.default.join(service.dir, 'config');
    // 遍历配置目录，寻找子Service配置
    _fs2.default.readdirSync(configDir).forEach(name => {
      if (name[0] === '.') return;
      if (name === serviceId + '.js') return; // 此文件是当前Service配置，不是子Service配置
      let path = _path2.default.join(configDir, name);
      if (name.endsWith('.js')) {
        name = name.substr(0, name.length - 3);
      }
      if (!_lodash2.default.isPlainObject(metadata.services[name])) return; // 没有依赖此子Service
      // 检查依赖
      let serviceConfig = configs[serviceId];
      if (!serviceConfig) return; // 项目没有安装当前子Service
      if (!_lodash2.default.isPlainObject(serviceConfig.services[name])) return;
      if (!plugins[name]) {
        plugins[name] = {};
      }
      let pluginRelative = _path2.default.relative(dir, path);
      plugins[name][pluginRelative] = path;
      let pluginConfigFile = path;
      if (!path.endsWith('.js')) {
        pluginConfigFile = _path2.default.join(configDir, name, 'config.js');
      }
      if ((0, _utils.isFile)(pluginConfigFile)) {
        let pluginConfig = require(pluginConfigFile).default;
        resolvePluginPath(pluginConfig, pluginConfigFile);
        configs[name] = (0, _utils.merge)(configs[name], pluginConfig);
      }
    });
  });

  // 加载插件配置
  _lodash2.default.forEach(configs, (config, serviceId) => {
    if (!_lodash2.default.size(config.plugins)) return;
    _lodash2.default.forEach(config.plugins, (path, key) => {
      if (!plugins[serviceId]) {
        plugins[serviceId] = {};
      }
      if (!plugins[serviceId].hasOwnProperty(key)) {
        plugins[serviceId][key] = path;
      }
    });
  });

  _lodash2.default.forEach(metadata.services, (service, serviceId) => {
    service.plugins = _lodash2.default.reduce(plugins[serviceId], (res, pluginDir, key) => {
      let templatesDir = _path2.default.join(pluginDir, 'templates');
      if ((0, _utils.isDirectory)(templatesDir)) {
        service.templatesDirs.push(templatesDir);
      }
      res[key] = readPlugin(pluginDir, metadata.locales);
      return res;
    }, {});
  });

  // 读取app中间件
  _lodash2.default.forEach(configs, cfg => {
    _lodash2.default.forEach(cfg.middlewares, (item, middlewareId) => {
      if (!item || item.fn) return;
      middlewareId = item.id || middlewareId;
      metadata.middlewares[middlewareId] = middlewareId;
    });
  });

  return metadata;
}