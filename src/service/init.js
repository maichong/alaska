/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const assert = require('assert');
const util = require('../util');

module.exports = async function init() {
  this.debug('%s init', this.id);
  this.init = util.noop;

  //加载扩展配置
  for (let dir of this._configDirs) {
    let configFile = dir + '/config.js';
    if (util.isFile(configFile)) {
      this.applyConfig(require(configFile).default);
    }
  }

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
    if (util.isDirectory(configDir)) {
      sub._configDirs.push(configDir);
    }
    await sub.init();
  }
};
