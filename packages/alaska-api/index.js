"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const compose = require("koa-compose");
const alaska_1 = require("alaska");
const defaultApiControllers = require("./api");
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
class ApiExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        this.inited = new Set();
        this.routers = new Map();
        this.apiInfos = new Map();
        _.forEach(main.modules.services, (s) => {
            let service = s.service;
            this.createInitApi(s, service);
        });
        main.post('initHttp', async () => {
            await main.initApi();
        });
    }
    getRouter(apiPrefix) {
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
    createInitApi(s, service) {
        collie(service, 'initApi', async () => {
            service.debug('initApi');
            (() => {
                if (!_.size(s.api)
                    && !_.find(s.plugins, (plugin) => !!_.size(plugin.api))
                    && !_.find(service.models, (model) => model.api && !!_.find(model.api, (level) => level > 0)))
                    return;
                let apiPrefix = service.config.get('apiPrefix');
                if (apiPrefix === false)
                    return;
                let info = this.apiInfos.get(apiPrefix);
                if (!info) {
                    info = {
                        models: new Map(),
                        apis: new Map()
                    };
                    this.apiInfos.set(apiPrefix, info);
                }
                const models = new Map();
                _.forEach(service.models, (model) => {
                    models.set(model.key, model);
                    if (model.api && _.find(model.api, (level) => level > 0)) {
                        if (info.models.has(model.key)) {
                            throw new Error(`Init api failed, ${model.id} conflict to ${info.models.get(model.key).id}`);
                        }
                        info.models.set(model.key, model);
                    }
                });
                function applyPlugin(api, group) {
                    if (!info.apis.has(group)) {
                        info.apis.set(group, new Map());
                    }
                    let groupInfo = info.apis.get(group);
                    _.forEach(api, (fn, action) => {
                        if (typeof fn !== 'function' || action.startsWith('__'))
                            return;
                        if (action[0] === '_') {
                            let model = models.get(group);
                            if (!model)
                                return;
                            info.models.set(group, model);
                        }
                        if (groupInfo.has(action)) {
                            if (!Array.isArray(groupInfo.get(action))) {
                                groupInfo.set(action, [groupInfo.get(action)]);
                            }
                            groupInfo.set(action, groupInfo.get(action).concat(fn));
                        }
                        else {
                            groupInfo.set(action, fn);
                        }
                    });
                }
                _.forEach(s.plugins, (plugin) => {
                    _.forEach(plugin.api, applyPlugin);
                });
                _.forEach(s.api, applyPlugin);
            })();
            for (let [sid, sub] of service.services) {
                if (this.inited.has(sid))
                    continue;
                this.inited.add(sid);
                await sub.initApi();
            }
            if (!service.isMain())
                return;
            for (let info of this.apiInfos.values()) {
                for (let apiGroup of info.apis.values()) {
                    for (let [action, middlewares] of apiGroup) {
                        if (Array.isArray(middlewares)) {
                            let fn = compose(middlewares);
                            fn._methods = middlewares[0]._methods;
                            apiGroup.set(action, fn);
                        }
                    }
                }
            }
            for (let [apiPrefix, info] of this.apiInfos) {
                let router = this.getRouter(apiPrefix);
                let hasExtApi = false;
                let hasRecordApi = false;
                for (let api of info.apis.values()) {
                    if (!hasExtApi || !hasRecordApi) {
                        for (let key of api.keys()) {
                            if (key[0] === '_') {
                                hasRecordApi = true;
                            }
                            else if (!REST_ACTIONS.has(key)) {
                                hasExtApi = true;
                            }
                        }
                    }
                }
                if (hasExtApi) {
                    router.all('/:group/:action?', async (ctx, next) => {
                        let { group, action } = ctx.params;
                        if (!action) {
                            action = 'default';
                        }
                        let apiGroup = info.apis.get(group);
                        if (apiGroup && apiGroup.has(action) && action[0] !== '_') {
                            if (action === 'default') {
                                await next();
                                if (ctx.body) {
                                    return;
                                }
                            }
                            else if (REST_ACTIONS.has(action)) {
                                await next();
                                return;
                            }
                            let middleware = apiGroup.get(action);
                            let methods = middleware._methods || { POST: true };
                            if (methods[ctx.method] !== true)
                                ctx.throw(405);
                            ctx.service = service;
                            ctx.state.apiAction = action;
                            await middleware(ctx, next);
                            return;
                        }
                        await next();
                    });
                }
                if (hasRecordApi) {
                    router.all('/:group/:id/:action', async (ctx, next) => {
                        let { group, action, id } = ctx.params;
                        let fnName = `_${action}`;
                        let model = info.models.get(group);
                        let apiGroup = info.apis.get(group);
                        if (!model || !apiGroup || typeof apiGroup.get(fnName) !== 'function') {
                            await next();
                            return;
                        }
                        let middleware = apiGroup.get(fnName);
                        let methods = middleware._methods || { POST: true };
                        if (methods[ctx.method] !== true)
                            service.error(405);
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
                function restApi(action) {
                    return (ctx, next) => {
                        let modelKey = ctx.params.model;
                        let model = info.models.get(modelKey);
                        ctx.state.model = model;
                        ctx.state.apiAction = action;
                        let middlewares = [];
                        if (ctx.params.id) {
                            ctx.state.id = ctx.params.id;
                        }
                        let apiGroup = info.apis.get(modelKey);
                        if (apiGroup && apiGroup.has(action)) {
                            middlewares = middlewares.concat(apiGroup.get(action));
                        }
                        if (model && model.api && model.api[action]) {
                            middlewares.push(defaultApiControllers[action]);
                        }
                        if (!middlewares.length) {
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
ApiExtension.after = ['alaska-model', 'alaska-http', 'alaska-routes'];
exports.default = ApiExtension;
