// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import _ from 'lodash';
import * as utils from '../utils';

export default async function loadPlugins() {
  this.loadPlugins = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadPlugins();
  }

  this.debug('loadPlugins');

  this.plugins = {};

  _.forEach(this.config('plugins', {}), (Plugin, key) => {
    if (typeof Plugin === 'string') {
      // $Flow
      Plugin = require(Plugin).default;
    }
    this.plugins[key] = new Plugin(this);
  });
}
