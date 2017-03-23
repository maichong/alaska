// @flow

/* eslint no-console:0 */
/* eslint global-require:0 */
/* eslint prefer-arrow-callback:0 */

import _ from 'lodash';
import compose from 'koa-compose';
import * as utils from '../utils';
import { NormalError } from '../alaska';

export default async function loadApi() {
  this.loadApi = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadApi();
  }
  if (this.config('prefix') === false || this.config('api') === false) return;
  this.debug('loadApi');

  const service: Alaska$Service = this;

  const router = service.router;

  this._apiControllers = utils.include(this.dir + '/api', false) || {};

  const apis = this._apiControllers;

  this._configDirs.forEach((dir) => {
    dir += '/api';
    if (utils.isDirectory(dir)) {
      let patches = utils.include(dir, false) || {};
      _.forEach(patches, (patch, c) => {
        if (!apis[c]) {
          apis[c] = {};
        }
        _.forEach(patch, (fn, name) => {
          if (name[0] === '_' || typeof fn !== 'function') return;
          if (!apis[c][name]) {
            apis[c][name] = fn;
          } else if (typeof apis[c][name] === 'function') {
            apis[c][name] = [fn, apis[c][name]];
          } else if (Array.isArray(apis[c][name])) {
            apis[c][name].unshift(fn);
          }
        });
      });
    }
  });

  //将某些API的多个中间件转换成一个
  _.forEach(apis, (api) => {
    _.forEach(api, (fn, key) => {
      if (Array.isArray(fn) && key[0] !== '_') {
        api[key] = compose(fn);
      }
    });
  });

  const defaultApiController = require('../api');

  const models = _.reduce(this.models, (res, Model) => {
    res[Model.id] = Model;
    return res;
  }, {});

  function onError(ctx: Context, error) {
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
    console.error(`URL: ${ctx.path} ${service.id} API ${error.stack}`);
    //如果是数据验证错误
    if (error.message === 'Validation failed' && error.errors) {
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

  //扩展接口
  let extension = false;
  _.forEach(apis, (api) => {
    if (extension) return;
    _.forEach(api, (fn, key) => {
      if (extension || key[0] === '_') return;
      if (REST_ACTIONS.indexOf(key) < 0) {
        extension = true;
      }
    });
  });

  if (extension) {
    router.register('/api/:controller?/:action?', ['POST', 'GET'], function (ctx, next) {
      let controller = ctx.params.controller;
      let action = ctx.params.action || 'default';
      // $Flow
      let ctrl = service._apiControllers[controller];
      if (ctrl && ctrl[action] && action[0] !== '_') {
        try {
          if (REST_ACTIONS.indexOf(action) > -1) {
            service.error(400);
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
