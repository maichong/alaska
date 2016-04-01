'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadMiddlewares;

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function loadMiddlewares() {
  this.loadMiddlewares = util.noop;
  let router = this.router;
  this.config('middlewares', []).forEach(function (item) {
    if (typeof item === 'string') {
      item = {
        name: item
      };
    }
    let name = item.name;
    if (name.startsWith('.')) {
      name = this.dir + name;
    }
    let middleware = require(name);
    let path = item.path;
    if (!path) {
      router.use(path, middleware(item.options));
      return;
    }
    let methods = item.methods || ['GET', 'POST'];
    if (methods === 'all') {
      router.all(path, middleware(item.options));
      return;
    }
    if (typeof methods === 'string') {
      methods = [methods];
    }
    router.register(path, methods, middleware(item.options));
  });
  let middlewaresFile = this.dir + '/middlewares/index.js';
  if (util.isFile(middlewaresFile)) {
    let middlewares = util.include(middlewaresFile, true, {
      service: this,
      alaska: this.alaska
    });
    middlewares(router);
  }
} /**
   * @copyright Maichong Software Ltd. 2016 http://maichong.it
   * @date 2016-02-28
   * @author Liang <liang@maichong.it>
   */

;