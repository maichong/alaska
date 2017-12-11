/**
 * @copyright Maichong Software Ltd. 2017 http://maichong.it
 * @date 2017-11-20
 * @author Liang <liang@maichong.it>
 */

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import _ from 'lodash';
import Path from 'path';
import createMetadata from './metadata';

function requireFiles(files, withDefault) {
  let res = {};
  _.forEach(files, (file, key) => {
    let m = require(file);
    res[key] = withDefault ? m.default : m;
  });
  return res;
}

export default function createModules(mainService: Alaska$Service) {
  let metadata = createMetadata(mainService.id, mainService.dir, mainService.configFile);

  let modules = {
    fields: {},
    drivers: {},
    renderers: {},
    middlewares: {},
    services: {}
  };

  _.forEach(metadata.fields, (lib) => {
    modules.fields[lib] = require(lib).default;
  });

  _.forEach(metadata.drivers, (lib) => {
    modules.drivers[lib] = require(lib).default;
  });

  _.forEach(metadata.renderers, (lib) => {
    modules.renderers[lib] = require(lib).default;
  });

  _.forEach(metadata.middlewares, (lib) => {
    modules.middlewares[lib] = require(lib);
  });

  _.forEach(metadata.services, (cfg, serviceId) => {
    const service = {
      id: serviceId,
      service: require(cfg.dir).default,
      config: require(cfg.config).default,
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
      service.templatesDirs = cfg.templatesDirs.map((d) => Path.relative(mainService.dir, d));
    }
    if (cfg.plugins) {
      service.plugins = _.map(cfg.plugins, (plugin) => {
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
        return res;
      });
    }
  });

  return modules;
}
