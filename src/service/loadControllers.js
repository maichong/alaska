/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');

module.exports = function loadControllers() {
  this.loadControllers = util.noop;
  let service = this;

  let original = global.__service;
  global.__service = this;
  this._controllers = util.include(this.dir + '/controllers', false) || {};
  global.__service = original;

  this.router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], async function (ctx, next) {
    let controller = ctx.params.controller || service.config('defaultController');
    let action = ctx.params.action || service.config('defaultAction');
    service.debug('route %s:%s', controller, action);
    if (service._controllers[controller] && service._controllers[controller][action] && action[0] !== '_') {
      let promise = service._controllers[controller][action](ctx, next);
      //异步函数
      if (promise && promise.then) {
        await promise;
      }
      //同步函数,直接返回
      return;
    }
    await next();
  });//end of register
};
