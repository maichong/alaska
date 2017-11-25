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

  _.forEach(serviceModules.plugins, ({ Plugin }, key) => {
    if (!Plugin) return;
    this.plugins[key] = new Plugin(this);
  });
}
