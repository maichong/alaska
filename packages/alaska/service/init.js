// @flow

/* eslint no-console:0 */

import _ from 'lodash';
import * as utils from '../utils';

export default async function init() {
  this.debug('init');
  this.init = utils.resolved;

  try {
    const { alaska } = this;
    let serviceModules = alaska.modules.services[this.id];
    if (!serviceModules) {
      this.panic('Invalid service modules settings!');
    }
    this.applyConfig(serviceModules.config);
    let services = this.getConfig('services') || {};
    _.forEach(services, (config, serviceId) => {
      if (config.optional && !alaska.hasService(serviceId)) return;
      let sub = alaska.getService(serviceId);
      sub.applyConfig(config);
      this.services[serviceId] = sub;
    });

    // Models
    _.forEach(serviceModules.models, (Model, name) => {
      Model.service = this;
      this.models[name] = Model;
    });

    // Sleds
    _.forEach(serviceModules.sleds, (Sled, name) => {
      Sled.service = this;
      Sled.sledName = name;
      Sled.key = utils.nameToKey(this.id + '.' + name);
      this.sleds[name] = Sled;
    });

    for (let sub of this.serviceList) {
      await sub.init();
    }
  } catch (error) {
    console.error(`${this.id} init field:`, error.message);
    throw error;
  }
}
