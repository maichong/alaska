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
    this.loadControllers = util.resolved;

    for (let s of this._services) {
      yield s.loadControllers();
    }
    if (this.config('prefix') === false || this.config('controllers') === false) {
      return;
    }
    this.debug('loadControllers');

    const service = this;
    const alaska = this.alaska;

    this._controllers = util.include(this.dir + '/controllers', false, { alaska, service }) || {};

    const defaultController = this.config('defaultController');
    const defaultAction = this.config('defaultAction');

    this.router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], (() => {
      var ref = _asyncToGenerator(function* (ctx, next) {
        let controller = ctx.params.controller || defaultController;
        let action = ctx.params.action || defaultAction;
        service.debug('route %s:%s', controller, action);
        if (service._controllers[controller] && service._controllers[controller][action] && action[0] !== '_') {
          let promise = service._controllers[controller][action](ctx, next);
          //异步函数
          if (promise && promise.then) {
            yield promise;
          }
          //同步函数,直接返回
          return;
        }
        yield next();
      });

      return function (_x, _x2) {
        return ref.apply(this, arguments);
      };
    })()); //end of register
  });

  function loadControllers() {
    return ref.apply(this, arguments);
  }

  return loadControllers;
})();