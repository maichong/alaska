// @flow

import _ from 'lodash';
import * as utils from '../utils';

export default async function loadPlugins() {
  this.loadPlugins = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadPlugins();
  }

  this.debug('loadPlugins');

  let serviceModules = this.alaska.modules.services[this.id];

  this.plugins = {};

  _.forEach(serviceModules.plugins, ({ pluginClass }, key) => {
    if (!pluginClass) return;
    this.debug('plugin', pluginClass.name);
    // eslint-disable-next-line new-cap
    this.plugins[key] = new pluginClass(this);
  });
}
