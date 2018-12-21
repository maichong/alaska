import * as _ from 'lodash';
import * as collie from 'collie';
import * as compose from 'koa-compose';
import * as Router from 'koa-router';
import { Service, MainService, Extension } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import { CustomApi, ApiMiddleware } from 'alaska-api';
import { Context } from 'alaska-http';
import { Model, ModelApi } from 'alaska-model';
import * as defaultApiControllers from './api';

interface ApiGroup {
  [key: string]: ApiMiddleware | ApiMiddleware[];
}

interface ApiInfo {
  models: {
    [key: string]: typeof Model;
  };
  apis: {
    [group: string]: ApiGroup;
  };
}

const REST_ACTIONS = [
  'count',
  'show',
  'list',
  'paginate',
  'create',
  'remove',
  'removeMulti',
  'update',
  'updateMulti',
  'watch'
];

function createDecorator(method: string) {
  return function (middleware: ApiMiddleware, allow?: boolean) {
    if (!middleware._methods) {
      middleware._methods = {};
    }
    // @ts-ignore index
    middleware._methods[method] = allow !== false;
  };
}

export const GET = createDecorator('GET');
export const POST = createDecorator('POST');
export const HEAD = createDecorator('HEAD');
export const PATCH = createDecorator('PATCH');
export const PUT = createDecorator('PUT');
export const DELETE = createDecorator('DELETE');
export const OPTIONS = createDecorator('OPTIONS');

export default class ApiExtension extends Extension {
  static after = ['alaska-model', 'alaska-http', 'alaska-routes'];
  inited: string[];
  routers: Map<string, Router>;
  apiInfos: {
    [prefix: string]: ApiInfo;
  };

  constructor(main: MainService) {
    super(main);
    this.inited = [];
    this.routers = new Map();
    this.apiInfos = {};

    _.forEach(main.modules.services, (s: ServiceModules) => {
      let service: Service = s.service;
      this.createInitApi(s, service);
    });

    main.post('initHttp', async () => {
      await main.initApi();
    });
  }

  getRouter(apiPrefix: string): Router {
    let router = this.routers.get('apiPrefix');
    if (!router) {
      router = this.main.getRouter(apiPrefix);
      this.routers.set(apiPrefix, router);
      router.use((ctx, next) => {
        ctx.state.jsonApi = true;
        return next();
      });
    }
    return router;
  }

  createInitApi(s: ServiceModules, service: Service) {
    collie(service, 'initApi', async () => {
      service.debug('initApi');

      // 首先初始化子Service
      for (let sid in service.services) {
        if (this.inited.includes(sid)) continue;
        this.inited.push(sid);
        let sub = service.services[sid];
        await sub.initApi();
      }

      (() => {
        // 检查是否开放了接口
        if (
          !_.size(s.api) // Service API
          && !_.find(s.plugins, (plugin) => !!_.size(plugin.api)) // 检查Plugin
          && !_.find(service.models, (model) => model.api && !!_.find(model.api, level => level > 0)) // Model
        ) return;

        let apiPrefix = service.config.get('apiPrefix');
        if (apiPrefix === false) return; // 该Service 强制关闭了API

        let info: ApiInfo = this.apiInfos[apiPrefix];
        if (!info) {
          info = {
            models: {},
            apis: {}
          };
          this.apiInfos[apiPrefix] = info;
        }

        function applyPlugin(api: CustomApi, group: string) {
          if (!info.apis[group]) {
            info.apis[group] = {};
          }
          let groupInfo = info.apis[group];
          _.forEach(api, (fn, action) => {
            if (action[0] === '_') return;
            if (groupInfo[action]) {
              if (!Array.isArray(groupInfo[action])) {
                // 转换为数组
                groupInfo[action] = [<ApiMiddleware>groupInfo[action]];
              }
              groupInfo[action] = (<ApiMiddleware[]>groupInfo[action]).concat(fn);
            } else {
              groupInfo[action] = fn;
            }
          });
        }
        _.forEach(s.plugins, (plugin) => {
          _.forEach(plugin.api, applyPlugin);
        });
        _.forEach(s.api, applyPlugin);

        _.forEach(service.models, (model) => {
          if (model.api && _.find(model.api, (level) => level > 0)) {
            if (info.models[model.key]) {
              throw new Error(`Init api failed, ${model.id} conflict to ${info.models[model.key].id}`);
            }
            info.models[model.key] = model;
          }
        });
      })();

      if (!service.isMain()) return;

      // 由主Service 挂载接口

      // 将所有接口数组转为接口函数
      _.forEach(this.apiInfos, (info) => {
        _.forEach(info.apis, (apiGroup) => {
          for (let action in apiGroup) {
            if (Array.isArray(apiGroup[action])) {
              let array = apiGroup[action] as ApiMiddleware[];
              apiGroup[action] = compose(array);
              for (let fn of array) {
                if (fn._methods) {
                  (apiGroup[action] as ApiMiddleware)._methods = fn._methods;
                  break;
                }
              }
            }
          }
        });
      });

      // 挂载
      _.forEach(this.apiInfos, (info, apiPrefix) => {
        let router = this.getRouter(apiPrefix);

        // 判断是否存在扩展接口
        let hasExtApi = !!_.find(info.apis, (api) => !!_.find(api, (fn, key) => !REST_ACTIONS.includes(key)));
        if (hasExtApi) {
          router.use('/:group/:action?', async (ctx: Context, next) => {
            let { group, action } = ctx.params;
            if (!action) {
              action = 'default';
            }

            let apiGroup = info.apis[group];

            if (apiGroup && apiGroup[action] && action[0] !== '_') {
              if (action === 'default') {
                // 如果 action 为 default，说明一定是 REST 接口，优先处理REST
                await next();
                if (ctx.body) {
                  return;
                }
              } else if (REST_ACTIONS.indexOf(action) > -1) {
                await next();
                return;
              }
              let middleware = apiGroup[action] as ApiMiddleware;
              // check motheds
              let methods = middleware._methods || { POST: true };
              // console.log(ctx.method, methods);
              // @ts-ignore index
              if (methods[ctx.method] !== true) service.error(405);
              ctx.service = service;
              await middleware(ctx, next);
              return;
            }
            await next();
          });
        }

        // 挂载Restful接口
        function restApi(action: keyof ModelApi): ApiMiddleware {
          return (ctx: Context, next) => {
            let modelId = ctx.params.model;
            let model = info.models[modelId];
            if (!model) {
              //404
              return next();
            }
            ctx.state.model = model;
            let middlewares: ApiMiddleware[] = [];
            if (ctx.params.id) {
              ctx.state.id = ctx.params.id;
            }

            // api 目录下定义的中间件
            if (info.apis[modelId] && info.apis[modelId][action]) {
              middlewares = middlewares.concat(info.apis[modelId][action]);
            }
            // Model.api参数定义的中间件
            if (model.api && model.api[action]) {
              // @ts-ignore
              middlewares.push(defaultApiControllers[action]);
            }

            if (!middlewares.length) {
              //404
              return next();
            }
            ctx.service = service;
            if (middlewares.length === 1) {
              return middlewares[0](ctx, next);
            }
            return compose(middlewares)(ctx, next);
          };
        }
        router.get('/:model/count', restApi('count'));
        router.get('/:model/paginate', restApi('paginate'));
        router.get('/:model/watch', restApi('watch'));
        router.get('/:model/:id', restApi('show'));
        router.get('/:model', restApi('list'));
        router.post('/:model', restApi('create'));
        router.patch('/:model/:id', restApi('update'));
        router.patch('/:model', restApi('updateMulti'));
        router.del('/:model/:id', restApi('remove'));
        router.del('/:model', restApi('removeMulti'));
      });
    });
  }
}
