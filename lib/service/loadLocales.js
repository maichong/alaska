'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var util = _interopRequireWildcard(_util);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-03-31
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    this.loadLocales = util.noop;
    const alaska = this.alaska;

    for (let s of this._services) {
      yield s.loadLocales();
    }

    const locales = this._locales = {};

    const allowed = alaska.main.config('locales', []);

    for (let name of allowed) {
      let file = _path2.default.join(__dirname, '../locales/', name, 'messages.js');
      if (util.isFile(file)) {
        locales[name] = _lodash2.default.clone(require(file).default);
      }
    }

    function readLocales(dir) {
      if (!util.isDirectory(dir)) {
        return;
      }
      let names = _fs2.default.readdirSync(dir);
      for (let name of names) {
        if (allowed.indexOf(name) === -1) {
          //不允许的语言,直接跳过
          continue;
        }
        let file = dir + '/' + name + '/messages.js';
        if (!util.isFile(file)) {
          continue;
        }
        let messages = require(file).default;
        if (locales[name]) {
          _lodash2.default.assign(locales[name], messages);
        } else {
          locales[name] = messages;
        }
      }
    }

    readLocales(this.dir + '/locales');
    for (let dir of this._configDirs) {
      readLocales(dir + '/locales');
    }
  });

  function loadLocales() {
    return ref.apply(this, arguments);
  }

  return loadLocales;
})();