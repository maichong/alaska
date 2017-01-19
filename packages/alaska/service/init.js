// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import * as utils from '../utils';

export default async function init() {
  this.debug('init');
  this.init = utils.resolved;

  try {
    let services = this.config('services') || {};
    Object.keys(services).forEach((serviceId) => {
      let config = services[serviceId];
      let sub = this.alaska.service(serviceId, true);
      if (!sub) {
        if (config.dir) {
          // $Flow
          sub = require(config.dir).default;
        } else {
          // $Flow
          sub = require(serviceId).defualt;
        }
      }
      sub.applyConfig(config);
      this.services[serviceId] = sub;
      let configDir = this.dir + '/config/' + serviceId;
      sub.addConfigDir(configDir);
    });

    for (let sub of this.serviceList) {
      await sub.init();
    }
  } catch (error) {
    console.error(`${this.id} init field:`, error.message);
    throw error;
  }
};
