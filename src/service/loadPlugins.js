/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import * as util from '../util';

export default async function loadPlugins() {
  this.loadPlugins = util.resolved;

  for (let sub of this.serviceList) {
    await sub.loadPlugins();
  }
  this.debug('loadPlugins');

  this._plugins = {};

  _.forEach(this.config('plugins', {}), (Plugin, key) => {
    if (typeof Plugin === 'string') {
      Plugin = require(Plugin).default;
    }
    this._plugins[key] = new Plugin(this);
  });
}
