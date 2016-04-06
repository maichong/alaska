/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';

export default async function loadControllers() {
  this.loadControllers = util.resolved;

  for (let s of this._services) {
    await s.loadControllers();
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

  this.router.register('/:controller?/:action?', ['GET', 'HEAD', 'POST'], async function (ctx, next) {
    let controller = ctx.params.controller || defaultController;
    let action = ctx.params.action || defaultAction;
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
