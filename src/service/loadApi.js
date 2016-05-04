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
  if (this.config('prefix') === false || this.config('api') === false) return;
  this.debug('loadApi');

  const alaska = this.alaska;
  const service = this;
  const router = this.router;

  const apis = this._apiControllers = util.include(this.dir + '/api', false, { alaska, service }) || {};

  this._configDirs.forEach(dir => {
    dir += '/api';
    if (util.isDirectory(dir)) {
      let patches = util.include(dir, false, { alaska, service }) || {};
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
  _.forEach(apis, api => {
    _.forEach(api, (fn, key) => {
      if (Array.isArray(fn) && key[0] !== '_') {
        api[key] = compose(fn);
      }
    });
  });

  const defaultApiController = require('../api');

  const models = _.reduce(this._models, (res, Model) => {
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
          error: ctx.t(error.message)
        };
        if (error.code) {
          body.code = error.code;
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
    ctx.body = {
      error: ctx.t('Internal Server Error'),
      code: 500
    };
  }

  router.all('/api/*', async function (ctx, next) {
    await next();
    if (!ctx.body) {
      if (ctx.status == 404) {
        ctx.body = { error: 'Not found' };
        ctx.status = 404;
      }
      if (ctx.status == 401) {
        ctx.body = { error: 'Unauthorized' };
        ctx.status = 401;
      }
      if (ctx.status == 403) {
        ctx.body = { error: 'Forbidden' };
        ctx.status = 403;
      }
    }
  });

  const REST_ACTIONS = ['count', 'show', 'list', 'create', 'remove', 'update'];
  let restApis = {};
  _.forEach(this._models, model => {
    if (!model.api) return;
    REST_ACTIONS.forEach(action => {
      restApis[action] = restApis[action] || !!model.api[action];
    });
  });

  _.forEach(apis, api => {
    REST_ACTIONS.forEach(action => {
      restApis[action] = restApis[action] || !!api[action];
    });
  });

  function restApi(action) {
    return function (ctx, next) {
      try {
        let modelId = ctx.params.model;
        //console.log(service);
        //console.log(service._models);
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
        return compose(middlewares)(ctx, next).catch(error => onError(ctx, error));
      } catch (error) {
        onError(ctx, error);
      }
    };
  }

  //扩展接口
  let extension = false;
  _.forEach(apis, api => {
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
      let ctrl = service._apiControllers[controller];
      if (ctrl && ctrl[action] && action[0] !== '_') {
        try {
          if (REST_ACTIONS.indexOf(action) > -1) {
            service.error(400);
          }
          let promise = ctrl[action](ctx, next);
          //异步函数
          if (promise && promise.then) {
            return promise.catch(error => {
              onError(ctx, error);
            });
          }
          //同步函数,直接返回
        } catch (error) {
          onError(ctx, error);
        }
        return;
      }
      return next();
    });
  }

  //Restful接口
  if (restApis.count) router.get('/api/:model/count', restApi('count'));
  if (restApis.show) router.get('/api/:model/:id', restApi('show'));
  if (restApis.list) router.get('/api/:model', restApi('list'));
  if (restApis.create) router.post('/api/:model', restApi('create'));
  if (restApis.update) router.put('/api/:model/:id', restApi('update'));
  if (restApis.remove) router.del('/api/:model/:id', restApi('remove'));
}
