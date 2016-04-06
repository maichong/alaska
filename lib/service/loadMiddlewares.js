'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-02-28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    this.loadMiddlewares = util.resolved;

    for (let s of this._services) {
      yield s.loadMiddlewares();
    }
    if (this.config('prefix') === false || !this.config('middlewares')) {
      return;
    }
    this.debug('loadMiddlewares');

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
  });

  function loadMiddlewares() {
    return ref.apply(this, arguments);
  }

  return loadMiddlewares;
})();