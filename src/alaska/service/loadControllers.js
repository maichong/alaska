// @flow

import _ from 'lodash';
import compose from 'koa-compose';
import * as utils from '../utils';

export default async function loadControllers() {
  this.loadControllers = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadControllers();
  }
  if (this.getConfig('prefix') === false) return;
  this.debug('loadControllers');

  const service = this;

  let serviceModules = this.alaska.modules.services[this.id];

  this._controllers = serviceModules.controllers || {};

  const controllers = this._controllers;

  // plugins
  _.forEach(serviceModules.plugins, (plugin) => {
    _.forEach(plugin.controllers, (patch, group) => {
      if (!controllers[group]) {
        controllers[group] = {};
      }
      _.forEach(patch, (fn, name) => {
        if (name[0] === '_' || typeof fn !== 'function') return;
        if (!controllers[group][name]) {
          controllers[group][name] = fn;
        } else if (typeof controllers[group][name] === 'function') {
          controllers[group][name] = [fn, controllers[group][name]];
        } else if (Array.isArray(controllers[group][name])) {
          controllers[group][name].unshift(fn);
        }
      });
    });
  });

  if (!_.size(controllers)) return;

  //将某些控制器的多个中间件转换成一个
  _.forEach(controllers, (ctrl) => {
    _.forEach(ctrl, (fn, key) => {
      if (Array.isArray(fn) && key[0] !== '_') {
        ctrl[key] = compose(fn);
      }
    });
  });

  const defaultController = this.getConfig('defaultController');
  const defaultAction = this.getConfig('defaultAction');

  const suffix = this.getConfig('suffix');
  this.router.register('/:controller?/:action?', this.getConfig('methods'), (ctx, next) => {
    let controller = ctx.params.controller || defaultController;
    let action = ctx.params.action || defaultAction;
    if (suffix && controller && controller.endsWith(suffix) && action === defaultAction) {
      // about.html
      controller = controller.substr(0, controller.length - suffix.length);
    }
    if (suffix && action && action.endsWith(suffix)) {
      // about/us.html
      action = action.substr(0, action.length - suffix.length);
    }
    service.debug('route %s:%s', controller, action);
    if (service._controllers[controller] && service._controllers[controller][action] && action[0] !== '_') {
      return service._controllers[controller][action](ctx, next);
    }
    return next();
  });
}
