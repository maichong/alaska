// @flow

import _ from 'lodash';
import * as utils from '../utils';

export default async function loadSleds() {
  this.loadSleds = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadSleds();
  }

  this.debug('loadSleds');

  let serviceModules = this.alaska.modules.services[this.id];

  _.forEach(this.sleds, (Sled, name) => {
    // 加载扩展配置
    _.forEach(serviceModules.plugins, (plugin) => {
      if (!plugin.sleds || !plugin.sleds[name]) return;
      let ext = plugin.sleds[name];
      if (ext.pre) {
        Sled.pre(ext.pre);
      }
      if (ext.post) {
        Sled.post(ext.post);
      }
      if (ext.default) {
        ext.default(Sled);
      }
    });
  });
}
