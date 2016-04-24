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
  if (typeof services === 'string') {
    services = [services];
  }

  for (let service of services) {
    if (typeof service === 'string') {
      service = { id: service };
    }
    let serviceId = service.id;
    let serviceAlias = service.alias;
    assert(typeof serviceId === 'string', 'Sub service id should be string.');
    let sub = this.alaska.service(serviceId);
    this._services.push(sub);
    assert(!this._alias[serviceId], 'Service alias is exists.');
    this._alias[serviceId] = sub;
    if (serviceAlias) {
      assert(!this._alias[serviceAlias], 'Service alias is exists.');
      this._alias[serviceAlias] = sub;
    }
    let configDir = this.dir + '/config/' + serviceId;
    sub._configDirs.push(configDir);
    if (util.isDirectory(configDir + '/templates')) {
      sub._templatesDirs.unshift(configDir + '/templates');
    }
    await sub.init();
  }
};
