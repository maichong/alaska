'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadAppMiddlewares;

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-02-28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

function loadAppMiddlewares() {
  this.loadAppMiddlewares = util.noop;
  let app = this.alaska.app;
  let alaska = this.alaska;
  let service = this;
  const locales = this.config('locales');
  const localeCookieKey = this.config('localeCookieKey');
  const localeQueryKey = this.config('localeQueryKey');
  app.use(function (ctx, next) {
    ctx.set('X-Powered-By', 'Alaska');
    ctx.service = service;
    ctx.alaska = alaska;

    //切换语言
    if (localeQueryKey) {
      if (ctx.query[localeQueryKey]) {
        let locale = ctx.query[localeQueryKey];
        if (locales.indexOf(locale) > -1) {
          ctx._locale = locale;
          ctx.cookies.set(localeCookieKey, locale, {
            maxAge: 365 * 86400 * 1000
          });
        }
      }
    }

    /**
     * 发送文件
     * @param {string} filePath
     * @param {Object} options
     */
    ctx.sendfile = (() => {
      var ref = _asyncToGenerator(function* (filePath, options) {
        options = options || {};
        let trailingSlash = '/' === filePath[filePath.length - 1];
        let index = options.index;
        if (index && trailingSlash) filePath += index;
        let maxage = options.maxage || options.maxAge || 0;
        let hidden = options.hidden || false;
        if (!hidden && util.isHidden(filePath)) return;

        let stats;
        try {
          stats = yield _fs2.default.stat(filePath);
          if (stats.isDirectory()) {
            if (index) {
              filePath += '/' + index;
              stats = yield _fs2.default.stat(filePath);
            } else {
              return;
            }
          }
        } catch (err) {
          let notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
          if (~notfound.indexOf(err.code)) return;
          err.status = 500;
          throw err;
        }
        ctx.set('Last-Modified', stats.mtime.toUTCString());
        ctx.set('Content-Length', stats.size);
        ctx.set('Cache-Control', 'max-age=' + (maxage / 1000 | 0));
        ctx.type = options.type || _mime2.default.lookup(filePath);
        ctx.body = _fs2.default.createReadStream(filePath);
      });

      return function (_x, _x2) {
        return ref.apply(this, arguments);
      };
    })();
    return next();
  });
  this.config('appMiddlewares', []).forEach(function (name) {
    if (typeof name === 'function') {
      //数组中直接就是一个中间件函数
      app.use(name);
      return;
    }
    let options;
    if (typeof name === 'object') {
      options = name.options;
      name = name.name;
    }
    if (name.startsWith('.')) {
      //如果是一个文件路径
      name = service.dir + '/' + name;
    }
    let middleware = require(name);
    app.use(middleware(options));
  });
}