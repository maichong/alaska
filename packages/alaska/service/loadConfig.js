// @flow

import Path from 'path';
import _ from 'lodash';
import * as utils from '../utils';

export default async function loadConfig() {
  this.loadConfig = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadConfig();
  }

  this.debug('loadConfig');

  let serviceModules = this.alaska.modules.services[this.id];

  _.forEach(serviceModules.plugins, (plugin) => {
    if (plugin.config) {
      this.applyConfig(plugin.config);
    }
  });

  if (this.isMain()) {
    let mainMiddlewares = this.getConfig('middlewares', {});
    for (let sub of this.serviceList) {
      let middlewares = sub.getConfig('middlewares', {});
      _.forEach(middlewares, (cfg, id) => {
        if (!mainMiddlewares[id]) {
          mainMiddlewares[id] = cfg;
        }
      });
    }
  }

  _.forEach(serviceModules.templatesDirs, (dir) => {
    this.templatesDirs.unshift(Path.relative(process.cwd(), dir));
  });
}
