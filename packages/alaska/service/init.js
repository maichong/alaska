// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

export default async function init() {
  this.debug('init');
  this.init = Promise.resolve();

  try {
    let services = this.config('services') || {};
    console.log('services', services);

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
      this._services[serviceId] = sub;
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
