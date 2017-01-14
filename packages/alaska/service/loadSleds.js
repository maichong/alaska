// @flow

import * as utils from '../utils';

export default async function loadSleds() {
  this.loadSleds = Promise.resolve();

  for (let sub of this.serviceList) {
    await sub.loadSleds();
  }

  this.debug('loadSleds');

  this.sleds = utils.include(this.dir + '/sleds', true) || {};

  for (let Sled of this.sledList) {
    Sled.service = this;
    Sled.key = utils.nameToKey(this.id + '.' + Sled.name);
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/sleds/' + Sled.name + '.js';
      if (utils.isFile(file)) {
        let ext = utils.include(file, false);
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
