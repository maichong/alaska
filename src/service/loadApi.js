/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import compose from 'koa-compose';
import * as util from '../util';

export default async function loadApi() {
  this.loadApi = util.resolved;

  for (let s of this._services) {
    await s.loadApi();
  }
  if (this.config('prefix') === false || this.config('api') === false) {
    return;
  }
  this.debug('loadApi');

  let alaska = this.alaska;
  let service = this;
  let router = this.router;

  this._apiControllers = util.include(this.dir + '/api', false, { alaska, service }) || {};

  let defaultApiController = require('../api');

  let models = _.reduce(this._models, (res, Model) => {
    res[Model.id] = Model;
    return res;
  }, {});

  function onError(ctx, error) {
    if (ctx.status === 404) {
      ctx.status = 500;
    }
    //普通业务逻辑错误
    if ((error instanceof alaska.NormalError)) {
      if (!ctx.body) {
        let body = {
          error: error.message
        };
        if (error.code) {
          body.code = error.code;
        }
        ctx.body = body;
      }
      return;
    }
    //如果不是普通错误,则输出错误信息
    console.error(`URL: ${ctx.path} ${service.id} API ${error.stack}`);
    ctx.body = {
      error: ctx.t('Internal Server Error')
    };
  }

  router.all('/api/*', async function (ctx, next) {
    await next();
    if (!ctx.body) {
      if (ctx.status == 404) {
        ctx.body = { error: 'Not found' };
      }
      if (ctx.status == 401) {
        ctx.body = { error: 'Unauthorized' };
      }
      if (ctx.status == 403) {
        ctx.body = { error: 'Forbidden' };
      }
    }
  });

  function restApi(action) {
    return function (ctx, next) {
      try {
        if (['show', 'update', 'remove'].indexOf(action) > -1) {
          if (!/^[a-f0-9]{24}$/.test(ctx.params.id)) {
            ctx.status = alaska.BAD_REQUEST;
            return;
          }
        }
        let modelId = ctx.params.model;
        //console.log(service);
        //console.log(service._models);
        let Model = models[modelId];
        if (!Model) {
          //404
          return next();
        }
        ctx.Model = Model;
        let middlewares = [];

        // api 目录下定义的中间件
        if (service._apiControllers[modelId] && service._apiControllers[modelId][action]) {
          middlewares.push(service._apiControllers[modelId][action]);
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
        return compose(middlewares)(ctx).catch(error => onError(ctx, error));
      } catch (error) {
        onError(ctx, error);
      }
    };
  }

  router.register('/api/:controller?/:action?', ['POST'], async function (ctx, next) {
    let controller = ctx.params.controller;
    let action = ctx.params.action || 'default';
    let ctrl = service._apiControllers[controller];
    if (ctrl && ctrl[action] && action[0] !== '_') {
      try {
        let promise = ctrl[action](ctx, next);
        //异步函数
        if (promise && promise.then) {
          await promise;
        }
        //同步函数,直接返回
      } catch (error) {
        onError(ctx, error);
      }
      return;
    }
    await next();
  });

  router.get('/api/:model/count', restApi('count'));
  router.get('/api/:model/:id', restApi('show'));
  router.get('/api/:model', restApi('list'));
  router.post('/api/:model', restApi('create'));
  router.put('/api/:model/:id', restApi('update'));
  router.del('/api/:model/:id', restApi('remove'));
}
