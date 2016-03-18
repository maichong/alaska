'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');
const fs = require('mz/fs');
const mime = require('mime');

module.exports = function loadAppMiddlewares() {
  this.loadAppMiddlewares = util.noop;
  let app = this.alaska.app;
  let alaska = this.alaska;
  let service = this;
  app.use(function (ctx, next) {
    ctx.set('X-Powered-By', 'Alaska');
    ctx.service = service;
    ctx.alaska = alaska;

    /**
     * 发送文件
     * @param {string} filePath
     * @param {object} options
     */
    ctx.sendfile = function () {
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
          stats = yield fs.stat(filePath);
          if (stats.isDirectory()) {
            if (index) {
              filePath += '/' + index;
              stats = yield fs.stat(filePath);
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
        ctx.type = options.type || mime.lookup(filePath);
        ctx.body = fs.createReadStream(filePath);
      });

      return function (_x, _x2) {
        return ref.apply(this, arguments);
      };
    }();
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
};