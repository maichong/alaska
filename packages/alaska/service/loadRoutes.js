// @flow

import _ from 'lodash';
import * as utils from '../utils';

export default async function loadRoutes() {
  this.loadRoutes = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadRoutes();
  }
  if (this.getConfig('prefix') === false) return;

  this.debug('loadRoutes');

  const { router } = this;

  let serviceModules = this.alaska.modules.services[this.id];

  _.forEachRight(serviceModules.plugins, (plugin) => {
    if (!plugin.routes) return;
    _.forEach(plugin.routes, (fn) => fn(router));
  });

  _.forEach(serviceModules.routes, (fn) => fn(router));
}
