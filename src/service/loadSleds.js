/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadSleds() {
  this.loadSleds = util.noop;
  const service = this;
  const alaska = this.alaska;

  for (let s of this._services) {
    await s.loadSleds();
  }

  this._sleds = util.include(this.dir + '/sleds', true, { alaska, service }) || {};
};
