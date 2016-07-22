/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import assert from 'assert';
import * as util from '../util';

export default async function init() {
  this.debug('init');
  this.init = util.resolved;

  let services = this.config('services') || [];

  for (let serviceId in services) {
    let config = services[serviceId];
    if (!config) continue;
    let sub = this.alaska.service(serviceId);
    assert(!this._services[serviceId], 'Service alias is exists.');
    sub.applyConfig(config);
    this._services[serviceId] = sub;
    let configDir = this.dir + '/config/' + serviceId;
    sub.addConfigDir(configDir);
    await sub.init();
  }
};
