'use strict';

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const util = require('../util');
const compose = require('koa-compose');

module.exports = function loadApi() {
  this.loadApi = util.noop;
  let alaska = this.alaska;
  let service = this;
  let router = this.router();

  this._apiControllers = util.include(this.dir + '/api');
  let defaultApiController = require('../api');
  let bodyParser = require('koa-bodyparser')();

  //TODO 优化性能
  function restApi(action) {
    return function (ctx, next) {

      function onError(error) {
        console.error(service.id + ' API ' + error.stack);
        if (!ctx.body) {
          if (ctx.status === 404) {
            ctx.status = 500;
          }
          ctx.body = {
            error: error.message
          };
        }
      }

      try {
        if (['show', 'update', 'remove'].indexOf(action) > -1) {
          if (!/^[a-f0-9]{24}$/.test(ctx.params.id)) {
            ctx.status = alaska.BAD_REQUEST;
            return;
          }
        }
        //console.log(ctx.params.model);
        //console.log(service);
        //console.log(service._models);
        let Model = service._models[ctx.params.model];
        //console.log(Model);
        if (!Model) {
          //404
          return;
        }
        let modelId = ctx.params.model.toLowerCase();
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
          return;
        }
        ctx.Model = Model;
        return compose(middlewares)(ctx).catch(onError);
      } catch (error) {
        onError(error);
        return;
      }
    };
  }

  router.get('/api/:model/count', restApi('count'));
  router.get('/api/:model/:id', restApi('show'));
  router.get('/api/:model', restApi('list'));
  router.post('/api/:model', bodyParser, restApi('create'));
  router.put('/api/:model/:id', bodyParser, restApi('update'));
  router.del('/api/:model/:id', restApi('remove'));
};