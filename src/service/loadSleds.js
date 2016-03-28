/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';


const util = require('../util');

module.exports = async function loadSleds() {
  this.loadSleds = util.noop;

  for (let service of this._services) {
    await service.loadSleds();
  }

  global.__service = this;
  this._sleds = util.include(this.dir + '/sleds') || {};
};
