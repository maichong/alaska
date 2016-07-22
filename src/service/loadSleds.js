/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadSleds() {
  this.loadSleds = util.resolved;

  for (let serviceId in this._services) {
    let sub = this._services[serviceId];
    await sub.loadSleds();
  }

  this.debug('loadSleds');

  this._sleds = util.include(this.dir + '/sleds', true) || {};

  for (let name in this._sleds) {
    let Sled = this._sleds[name];
    Sled.service = this;
    Sled.key = util.nameToKey(this.id + '.' + Sled.name);
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/sleds/' + name + '.js';
      if (util.isFile(file)) {
        let ext = util.include(file, false);
        if (ext.pre) {
          Sled.pre(ext.pre);
        }
        if (ext.post) {
          Sled.post(ext.post);
        }
        if (ext.default) {
          ext.default(Sled);
        }
      }
    }
  }
};
