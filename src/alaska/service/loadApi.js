// @flow

/* eslint no-console:0 */
/* eslint prefer-arrow-callback:0 */
/* eslint no-restricted-syntax:0 */
/* eslint guard-for-in:0 */

import _ from 'lodash';
import compose from 'koa-compose';
import { NormalError } from '../alaska';
import * as utils from '../utils';
import * as defaultApiController from '../api';

export default async function loadApi() {
  this.loadApi = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadApi();
  }
  if (this.getConfig('prefix') === false) return;

  this.debug('loadApi');

  const service: Alaska$Service = this;

  const { router } = service;

  let serviceModules = this.alaska.modules.services[this.id];

  this._apiControllers = serviceModules.api || {};

  const apis = this._apiControllers;

  // plugins
  _.forEach(serviceModules.plugins, (plugin) => {
    _.forEach(plugin.api, (patch, group) => {
      if (!apis[group]) {
        apis[group] = {};
      }
      _.forEach(patch, (fn, name) => {
        if (name[0] === '_' || typeof fn !== 'function') return;
        if (!apis[group][name]) {
          apis[group][name] = fn;
        } else if (typeof apis[group][name] === 'function') {
          apis[group][name] = [fn, apis[group][name]];
        } else if (Array.isArray(apis[group][name])) {
          apis[group][name].unshift(fn);
        }
      });
    });
  });

  //将某些API的多个中间件转换成一个
  _.forEach(apis, (api) => {
    _.forEach(api, (fn, key) => {
      if (Array.isArray(fn) && key[0] !== '_') {
        api[key] = compose(fn);
      }
    });
  });

  const models = _.reduce(this.models, (res, Model) => {
    res[Model.id] = Model;
    return res;
  }, {});

  if (!_.size(apis) && !_.size(models)) return;

  function onError(ctx: Alaska$Context, error) {
    if (ctx.status === 404) {
      ctx.status = 500;
    }
    //普通业务逻辑错误
    if ((error instanceof NormalError)) {
      if (!ctx.body) {
        let body = {
          error: ctx.t(error.message),
          code: error.code
        };
        if (error.code) {
          if (error.code >= 200 && error.code < 600) {
            //HTTP status
            ctx.status = error.code;
          }
        }
        ctx.body = body;
      }
      return;
    }
    //如果不是普通错误,则输出错误信息
    console.error(`${ctx.method} ${ctx.path} -> ${error.message} \n${error.stack}`);
    //如果是数据验证错误
    if (error.message.startsWith('Validation failed') && error.errors) {
      for (let key in error.errors) {
        ctx.body = {
          error: ctx.t('Validation failed.') + ' ' + error.errors[key].message,
          code: 500
        };
        return;
      }
    }
    ctx.body = {
      error: ctx.t('Internal Server Error'),
      code: 500
    };
  }

  // API错误处理
  router.all('/api/*', async(ctx, next) => {
    try {
      await next();
    } catch (error) {
      onError(ctx, error);
    }
    if (!ctx.body) {
      if (ctx.status === 404) {
        ctx.body = { error: 'Not found' };
        ctx.status = 404;
      }
      if (ctx.status === 401) {
        ctx.body = { error: 'Unauthorized' };
        ctx.status = 401;
      }
      if (ctx.status === 403) {
        ctx.body = { error: 'Forbidden' };
        ctx.status = 403;
      }
    }
  });

  // 所有支持的REST接口函数名
  const REST_ACTIONS = [
    'count',
    'show',
    'list',
    'paginate',
    'create',
    'remove',
    'removeMulti',
    'update',
    'updateMulti'
  ];

  // 记录下当前Service需要支持哪些REST API
  let restApis = {};
  _.forEach(this.models, (model) => {
    if (!model.api) return;
    REST_ACTIONS.forEach((action) => {
      restApis[action] = restApis[action] || !!model.api[action];
    });
  });

  _.forEach(apis, (api) => {
    REST_ACTIONS.forEach((action) => {
      restApis[action] = restApis[action] || !!api[action];
    });
  });

  // 注册某个类型API
  function restApi(action) {
    return function (ctx, next) {
      let modelId = ctx.params.model;
      let Model = models[modelId];
      if (!Model) {
        //404
        return next();
      }
      ctx.state.Model = Model;
      let middlewares = [];
      if (ctx.params.id) {
        ctx.state.id = ctx.params.id;
      }

      // api 目录下定义的中间件
      if (apis[modelId] && apis[modelId][action]) {
        middlewares.push(apis[modelId][action]);
      }

      // Model.api参数定义的中间件
      if (Model.api && Model.api[action]) {
        middlewares.push(defaultApiController[action]);
      }
      //console.log(middlewares);

      if (!middlewares.length) {
        //404
        return next();
      }
      return compose(middlewares)(ctx, next);
    };
  }

  // 判断是否存在扩展接口
  let extension = !!_.find(apis, (api) => _.find(api, (fn, key) => (key[0] !== '_' && REST_ACTIONS.indexOf(key) < 0)));

  if (extension) {
    router.register('/api/:controller?/:action?', ['POST', 'GET'], function (ctx, next) {
      let { controller, action } = ctx.params;
      if (!action) {
        action = 'default';
      }
      // $Flow
      let ctrl = service._apiControllers[controller];
      if (ctrl && ctrl[action] && action[0] !== '_') {
        try {
          if (REST_ACTIONS.indexOf(action) > -1) {
            return next();
          }
          let promise = ctrl[action](ctx, next);
          //异步函数
          if (promise && promise.then) {
            return promise.catch((error) => {
              onError(ctx, error);
            });
          }
          //同步函数,直接返回
        } catch (error) {
          onError(ctx, error);
        }
        return null;
      }
      return next();
    });
  }

  //Restful接口
  if (restApis.count) router.get('/api/:model/count', restApi('count'));
  if (restApis.paginate) router.get('/api/:model/paginate', restApi('paginate'));
  if (restApis.show) router.get('/api/:model/:id', restApi('show'));
  if (restApis.list) router.get('/api/:model', restApi('list'));
  if (restApis.create) router.post('/api/:model', restApi('create'));
  if (restApis.update) router.patch('/api/:model/:id', restApi('update'));
  if (restApis.updateMulti) router.patch('/api/:model', restApi('updateMulti'));
  if (restApis.remove) router.del('/api/:model/:id', restApi('remove'));
  if (restApis.removeMulti) router.del('/api/:model', restApi('removeMulti'));
}
