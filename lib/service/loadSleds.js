/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const util = require('../util');

module.exports = (() => {
  var ref = _asyncToGenerator(function* () {
    this.loadSleds = util.noop;

    for (let service of this._services) {
      yield service.loadSleds();
    }

    global.__service = this;
    this._sleds = util.include(this.dir + '/sleds') || {};
  });

  function loadSleds() {
    return ref.apply(this, arguments);
  }

  return loadSleds;
})();