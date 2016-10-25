/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadSleds() {
  this.loadSleds = util.resolved;

  for (let sub of this.serviceList) {
    await sub.loadSleds();
  }

  this.debug('loadSleds');

  this._sleds = util.include(this.dir + '/sleds', true) || {};

  for (let Sled of this.sledList) {
    Sled.service = this;
    Sled.key = util.nameToKey(this.id + '.' + Sled.name);
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/sleds/' + Sled.name + '.js';
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
