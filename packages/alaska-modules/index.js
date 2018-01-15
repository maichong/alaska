'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createModules;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _metadata = require('./metadata');

var _metadata2 = _interopRequireDefault(_metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-11-20
 * @author Liang <liang@maichong.it>
 */

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

const debug = (0, _debug2.default)('alaska-modules');

function requireFiles(files, withDefault) {
  let res = {};
  _lodash2.default.forEach(files, (file, key) => {
    debug('require ' + file);
    let m = require(file);
    res[key] = withDefault ? m.default : m;
  });
  return res;
}

function createModules(mainService) {
  let metadata = (0, _metadata2.default)(mainService.id, mainService.dir, mainService.configFile);

  let modules = {
    fields: {},
    drivers: {},
    renderers: {},
    middlewares: {},
    services: {}
  };

  _lodash2.default.forEach(metadata.fields, lib => {
    modules.fields[lib] = require(lib).default;
  });

  _lodash2.default.forEach(metadata.drivers, lib => {
    modules.drivers[lib] = require(lib).default;
  });

  _lodash2.default.forEach(metadata.renderers, lib => {
    modules.renderers[lib] = require(lib).default;
  });

  _lodash2.default.forEach(metadata.middlewares, lib => {
    modules.middlewares[lib] = require(lib);
  });

  _lodash2.default.forEach(metadata.services, (cfg, serviceId) => {
    const service = {
      id: serviceId,
      service: require(cfg.dir).default,
      config: require(cfg.config).default
    };
    modules.services[serviceId] = service;
    if (cfg.api) {
      service.api = requireFiles(cfg.api);
    }
    if (cfg.controllers) {
      service.controllers = requireFiles(cfg.controllers);
    }
    if (cfg.routes) {
      service.routes = requireFiles(cfg.routes, true);
    }
    if (cfg.locales) {
      service.locales = requireFiles(cfg.locales, true);
    }
    if (cfg.models) {
      service.models = requireFiles(cfg.models, true);
    }
    if (cfg.sleds) {
      service.sleds = requireFiles(cfg.sleds, true);
    }
    if (cfg.updates) {
      service.updates = requireFiles(cfg.updates, true);
    }
    if (cfg.templatesDirs) {
      service.templatesDirs = cfg.templatesDirs.map(d => _path2.default.relative(mainService.dir, d));
    }
    if (cfg.reactViews) {
      if (process.env.NODE_ENV === 'development') {
        service.reactViews = {};
        _lodash2.default.forEach(cfg.reactViews, (file, name) => {
          Object.defineProperty(service.reactViews, name, {
            get() {
              delete require.cache[require.resolve(file)];
              debug('require ' + file);
              return require(file).default;
            }
          });
        });
      } else {
        service.reactViews = requireFiles(cfg.reactViews, true);
      }
    }
    if (cfg.plugins) {
      service.plugins = _lodash2.default.reduce(cfg.plugins, (plugins, plugin, key) => {
        let res = {};
        if (plugin.pluginClass) {
          res.pluginClass = require(plugin.pluginClass).default;
        }
        if (plugin.config) {
          res.config = require(plugin.config).default;
        }
        if (plugin.api) {
          res.api = requireFiles(plugin.api);
        }
        if (plugin.controllers) {
          res.controllers = requireFiles(plugin.controllers);
        }
        if (plugin.routes) {
          res.routes = requireFiles(plugin.routes, true);
        }
        if (plugin.locales) {
          res.locales = requireFiles(plugin.locales, true);
        }
        if (plugin.models) {
          res.models = requireFiles(plugin.models);
        }
        if (plugin.sleds) {
          res.sleds = requireFiles(plugin.sleds);
        }
        plugins[key] = res;
        return plugins;
      }, {});
    }
  });

  return modules;
}