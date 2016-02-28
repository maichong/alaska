'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');

module.exports = function loadControllers() {
  this.loadControllers = util.noop;
  let router = this.router();
  let service = this;

  this._controllers = util.include(this.dir + '/controllers', false) || {};

  router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], function () {
    var ref = _asyncToGenerator(function* (ctx, next) {
      let controller = ctx.params.controller || service.config('defaultController');
      let action = ctx.params.action || service.config('defaultAction');
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
  }()); //end of register
};