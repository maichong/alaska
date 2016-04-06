'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-02-28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    var _this = this;

    this.loadStatics = util.resolved;

    for (let s of this._services) {
      yield s.loadStatics();
    }
    if (this.config('prefix') === false || !this.config('statics')) {
      return;
    }

    this.debug('loadStatics');

    let service = this;
    let statics = [];
    {
      let tmp = this.config('statics');
      if (tmp && typeof tmp === 'string') {
        statics.push({ root: tmp, prefix: '' });
      } else if (_lodash2.default.isArray(tmp)) {
        tmp.forEach(function (t) {
          if (t && typeof t === 'string') {
            statics.push({ root: t, prefix: '' });
          } else if (_lodash2.default.isObject(t) && t.root) {
            statics.push(t);
          }
        });
      } else if (_lodash2.default.isObject(tmp) && tmp.root) {
        statics.push(tmp);
      }
    }
    if (statics.length) {
      let router = this.router;
      statics.forEach(function (c) {
        let root = _path2.default.resolve(service.dir, c.root);
        let prefix = (c.prefix || '') + '/*';
        let prefixLength = _this.config('prefix').length + c.prefix.length;
        let index = c.index === false ? false : c.index || 'index.html';
        router.register(prefix, ['GET', 'HEAD'], (() => {
          var ref = _asyncToGenerator(function* (ctx, next) {
            yield next();
            if (ctx.body != null || ctx.status != 404) return;
            let filePath = root;
            if (prefixLength) {
              filePath += ctx.path.substr(prefixLength);
            } else {
              filePath += ctx.path;
            }
            yield ctx.sendfile(filePath, {
              index,
              maxAge: c.maxAge
            });
          });

          return function (_x, _x2) {
            return ref.apply(this, arguments);
          };
        })());
      });
    }
  });

  function loadStatics() {
    return ref.apply(this, arguments);
  }

  return loadStatics;
})();