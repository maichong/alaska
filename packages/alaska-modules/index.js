'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createModules;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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

function requireFiles(files, withDefault) {
  let res = {};
  _lodash2.default.forEach(files, (file, key) => {
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
      service.templatesDirs = cfg.templatesDirs;
    }
    if (cfg.plugins) {
      service.plugins = _lodash2.default.map(cfg.plugins, plugin => {
        let res = {};
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
        return res;
      });
    }
  });

  return modules;
}