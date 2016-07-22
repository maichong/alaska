/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-28
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';
import _ from 'lodash';

export default async function loadPlugins() {
  this.loadPlugins = util.resolved;

  for (let serviceId in this._services) {
    let sub = this._services[serviceId];
    await sub.loadPlugins();
  }
  this.debug('loadPlugins');

  this._plugins = {};

  _.forEach(this.config('plugins', {}), (plugin, key)=> {
    if (typeof plugin === 'string') {
      plugin = require(plugin).default;
    }
    this._plugins[key] = new plugin(this);
  });
}
