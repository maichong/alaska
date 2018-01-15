'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _koaCompose = require('koa-compose');

var _koaCompose2 = _interopRequireDefault(_koaCompose);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function loadControllers() {
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
  _lodash2.default.forEach(serviceModules.plugins, plugin => {
    _lodash2.default.forEach(plugin.controllers, (patch, group) => {
      if (!controllers[group]) {
        controllers[group] = {};
      }
      _lodash2.default.forEach(patch, (fn, name) => {
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

  if (!_lodash2.default.size(controllers)) return;

  //将某些控制器的多个中间件转换成一个
  _lodash2.default.forEach(controllers, ctrl => {
    _lodash2.default.forEach(ctrl, (fn, key) => {
      if (Array.isArray(fn) && key[0] !== '_') {
        ctrl[key] = (0, _koaCompose2.default)(fn);
      }
    });
  });

  const defaultController = this.getConfig('defaultController');
  const defaultAction = this.getConfig('defaultAction');

  const suffix = this.getConfig('suffix');
  this.router.register('/:controller?/:action?', this.getConfig('methods'), async (ctx, next) => {
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
      await service._controllers[controller][action](ctx, next);
    } else {
      await next();
    }
  });
};