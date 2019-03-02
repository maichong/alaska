import * as _ from 'lodash';
import * as collie from 'collie';
import * as compose from 'koa-compose';
import { Service, MainService, Extension } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import { Context, Router, Middleware } from 'alaska-http';
import { Model, ModelApi } from 'alaska-model';
import { CustomApi } from '.';
import * as defaultApiControllers from './api';

type ApiGroup = Map<string, Middleware | Middleware[]>;

interface ApiInfo {
  models: Map<string, typeof Model>;
  apis: Map<string, ApiGroup>;
}

const REST_ACTIONS = new Set([
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
]);

export default class ApiExtension extends Extension {
  static after = ['alaska-model', 'alaska-http', 'alaska-routes'];
  inited: Set<string>;
  routers: Map<string, Router>;
  // prefix -> ApiInfo
  apiInfos: Map<string, ApiInfo>;

  constructor(main: MainService) {
    super(main);
    this.inited = new Set();
    this.routers = new Map();
    this.apiInfos = new Map();

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
      router.all('(.*)', (ctx, next) => {
        ctx.state.jsonApi = true;
        return next();
      });
    }
    return router;
  }

  createInitApi(s: ServiceModules, service: Service) {
    collie(service, 'initApi', async () => {
      service.debug('initApi');

      (() => {
        // 检查是否开放了接口
        if (
          !_.size(s.api) // Service API
          && !_.find(s.plugins, (plugin) => !!_.size(plugin.api)) // 检查Plugin
          && !_.find(service.models, (model) => model.api && !!_.find(model.api, (level) => level > 0)) // Model
        ) return;

        let apiPrefix = service.config.get('apiPrefix');
        if (apiPrefix === false) return; // 该Service 强制关闭了API

        let info: ApiInfo = this.apiInfos.get(apiPrefix);
        if (!info) {
          info = {
            models: new Map(),
            apis: new Map()
          };
          this.apiInfos.set(apiPrefix, info);
        }

        const models: Map<string, typeof Model> = new Map();

        _.forEach(service.models, (model) => {
          models.set(model.key, model);
          if (model.api && _.find(model.api, (level) => level > 0)) {
            if (info.models.has(model.key)) {
              throw new Error(`Init api failed, ${model.id} conflict to ${info.models.get(model.key).id}`);
            }
            info.models.set(model.key, model);
          }
        });

        function applyPlugin(api: CustomApi, group: string) {
          if (!info.apis.has(group)) {
            info.apis.set(group, new Map());
          }
          let groupInfo = info.apis.get(group);
          _.forEach(api, (fn, action) => {
            if (typeof fn !== 'function' || action.startsWith('__')) return;
            if (action[0] === '_') {
              // record action
              let model = models.get(group);
              if (!model) return;
              info.models.set(group, model);
            }
            if (groupInfo.has(action)) {
              if (!Array.isArray(groupInfo.get(action))) {
                // 转换为数组
                groupInfo.set(action, [groupInfo.get(action) as Middleware]);
              }
              groupInfo.set(action, (groupInfo.get(action) as Middleware[]).concat(fn));
            } else {
              groupInfo.set(action, fn);
            }
          });
        }
        _.forEach(s.plugins, (plugin) => {
          _.forEach(plugin.api, applyPlugin);
        });
        _.forEach(s.api, applyPlugin);
      })();

      // 最后，初始化子Service，这样，当前Service就可以覆盖子Service接口
      for (let [sid, sub] of service.services) {
        if (this.inited.has(sid)) continue;
        this.inited.add(sid);
        await sub.initApi();
      }

      if (!service.isMain()) return;

      // 由主Service 挂载接口

      // 将所有接口数组转为接口函数
      for (let info of this.apiInfos.values()) {
        for (let apiGroup of info.apis.values()) {
          for (let [action, middlewares] of apiGroup) {
            if (Array.isArray(middlewares)) {
              let fn: Middleware = compose(middlewares);
              fn._methods = middlewares[0]._methods;
              apiGroup.set(action, fn);
            }
          }
        }
      }

      for (let [apiPrefix, info] of this.apiInfos) {
        let router = this.getRouter(apiPrefix);

        // 判断是否存在扩展接口
        let hasExtApi = false;
        let hasRecordApi = false;

        for (let api of info.apis.values()) {
          if (!hasExtApi || !hasRecordApi) {
            for (let key of api.keys()) {
              if (key[0] === '_') {
                hasRecordApi = true;
              } else if (!REST_ACTIONS.has(key)) {
                hasExtApi = true;
              }
            }
          }
        }

        if (hasExtApi) {
          router.all('/:group/:action?', async (ctx: Context, next) => {
            let { group, action } = ctx.params;
            if (!action) {
              action = 'default';
            }

            let apiGroup = info.apis.get(group);

            if (apiGroup && apiGroup.has(action) && action[0] !== '_') {
              if (action === 'default') {
                // 如果 action 为 default，说明一定是 REST 接口，优先处理REST
                await next();
                if (ctx.body) {
                  return;
                }
              } else if (REST_ACTIONS.has(action)) {
                await next();
                return;
              }
              let middleware = apiGroup.get(action) as Middleware;
              // check motheds
              let methods = middleware._methods || { POST: true };
              // console.log(ctx.method, methods);
              // @ts-ignore index
              if (methods[ctx.method] !== true) ctx.throw(405);
              ctx.service = service;
              await middleware(ctx, next);
              return;
            }
            await next();
          });
        }

        if (hasRecordApi) {
          router.all('/:group/:id/:action', async (ctx: Context, next) => {
            let { group, action, id } = ctx.params;
            let fnName = `_${action}`;
            let model = info.models.get(group);

            let apiGroup = info.apis.get(group);
            if (!model || !apiGroup || typeof apiGroup.get(fnName) !== 'function') {
              await next();
              return;
            }

            let middleware = apiGroup.get(fnName) as Middleware;
            // check motheds
            let methods = middleware._methods || { POST: true };
            // console.log(ctx.method, methods);
            // @ts-ignore index
            if (methods[ctx.method] !== true) service.error(405);

            let record = await model.findById(id).where(await model.createFiltersByContext(ctx)).session(ctx.dbSession);
            if (!record) {
              ctx.throw(404, 'Record not found');
            }
            ctx.state.id = id;
            ctx.state.record = record;
            ctx.service = service;
            await middleware(ctx, next);
          });
        }

        // 挂载Restful接口
        // eslint-disable-next-line no-inner-declarations
        function restApi(action: keyof ModelApi): Middleware {
          return (ctx: Context, next) => {
            let modelKey = ctx.params.model;
            let model = info.models.get(modelKey);
            ctx.state.model = model;

            let middlewares: Middleware[] = [];
            if (ctx.params.id) {
              ctx.state.id = ctx.params.id;
            }

            // api 目录下定义的中间件
            let apiGroup = info.apis.get(modelKey);
            if (apiGroup && apiGroup.has(action)) {
              middlewares = middlewares.concat(apiGroup.get(action));
            }
            // Model.api参数定义的中间件
            if (model && model.api && model.api[action]) {
              // @ts-ignore
              middlewares.push(defaultApiControllers[action]);
            }

            if (!middlewares.length) {
              // 404
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
      }

    });
  }
}
