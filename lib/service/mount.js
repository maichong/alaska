'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-04-05
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    this.mount = util.resolved;
    const alaska = this.alaska;

    for (let s of this._services) {
      yield s.mount('mount');
    }

    const domain = this.config(true, 'domain') || '';
    let prefix = this.config('prefix');
    if (prefix === false) {
      return;
    }
    this.debug('mount');
    if (!prefix) {
      prefix = '';
    }

    let point = domain + prefix;
    if (alaska._mounts[point]) {
      throw new Error(`Service mount error at ${ point }, ${ this.id } conflict to ${ alaska._mounts[point].id }`);
    }
    alaska._mounts[point] = this;
    this.domain = domain;
    this.prefix = prefix;
    this.routes = this.router.routes();
  });

  function mount() {
    return ref.apply(this, arguments);
  }

  return mount;
})();