'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const compose = require('koa-compose');
const util = require('../util');

module.exports = function loadApi() {
  this.loadApi = util.noop;
  let alaska = this.alaska;
  let service = this;
  let router = this.router();

  this._apiControllers = util.include(this.dir + '/api');
  let defaultApiController = require('../api');

  let models = _.reduce(this._models, (res, Model, name) => {
    name = name.replace(/([a-z])([A-Z])/g, (a, b, c) => b + '-' + c.toLowerCase()).toLowerCase();
    res[name] = Model;
    return res;
  }, {});

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
        let Model = models[ctx.params.model];
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
  router.post('/api/:model', restApi('create'));
  router.put('/api/:model/:id', restApi('update'));
  router.del('/api/:model/:id', restApi('remove'));

  router.post('/api/:controller/:action', function () {
    var ref = _asyncToGenerator(function* (ctx, next) {
      let controller = ctx.params.controller;
      let action = ctx.params.action;
      service.debug('api %s:%s', controller, action);

      if (service._apiControllers[controller] && service._apiControllers[controller][action] && action[0] !== '_') {
        try {
          let promise = service._apiControllers[controller][action](ctx, next);
          //异步函数
          if (promise && promise.then) {
            yield promise;
          }
          //同步函数,直接返回
        } catch (error) {
          if (!ctx.body) {
            if (ctx.status === 404) {
              ctx.status = 500;
            }
            let body = {
              error: error.message
            };
            if (error.code) {
              body.code = error.code;
            }
            ctx.body = body;
          }
        }
        return;
      }
      yield next();
    });

    return function (_x, _x2) {
      return ref.apply(this, arguments);
    };
  }());
};