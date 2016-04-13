/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadSleds() {
  this.loadSleds = util.resolved;
  const service = this;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.loadSleds();
  }

  this.debug('loadSleds');

  this._sleds = util.include(this.dir + '/sleds', true, { alaska, service }) || {};

  for (let name in this._sleds) {
    let Sled = this._sleds[name];
    //加载扩展配置
    for (let dir of this._configDirs) {
      let file = dir + '/sleds/' + name + '.js';
      if (util.isFile(file)) {
        let ext = util.include(file, false, { alaska, service });
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
