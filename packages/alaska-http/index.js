"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collie = require("collie");
const tr = require("grackle");
const http = require("http");
const Koa = require("koa");
const KoaQS = require("koa-qs");
const KoaRouter = require("koa-router");
const _ = require("lodash");
const alaska_1 = require("alaska");
const debug_1 = require("./debug");
function createDecorator(method) {
    return function (middleware, allow) {
        if (!middleware._methods) {
            middleware._methods = {};
        }
        middleware._methods[method] = allow !== false;
    };
}
exports.GET = createDecorator('GET');
exports.POST = createDecorator('POST');
exports.HEAD = createDecorator('HEAD');
exports.PATCH = createDecorator('PATCH');
exports.PUT = createDecorator('PUT');
exports.DELETE = createDecorator('DELETE');
exports.OPTIONS = createDecorator('OPTIONS');
class HttpExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        let routers = new Map();
        main.getRouter = (prefix) => {
            if (prefix === '/') {
                prefix = '';
            }
            let router = routers.get(prefix);
            if (!router) {
                router = new KoaRouter({
                    prefix
                });
                routers.set(prefix, router);
            }
            return router;
        };
        collie(main, 'initHttp', async () => {
            main.debug('initHttp');
            let env = main.config.get('env');
            if (!main.app) {
                main.app = new Koa();
                main.app.env = env;
                main.app.proxy = main.config.get('alaska-http.proxy');
                main.app.subdomainOffset = main.config.get('alaska-http.subdomainOffset');
                main.server = http.createServer(main.app.callback());
                KoaQS(main.app);
            }
            _(main.config.get('middlewares'))
                .map((options, id) => ({
                id,
                sort: options.sort || 0,
                options
            }))
                .filter((item) => item.sort >= 10000)
                .orderBy(['sort'], ['desc'])
                .forEach(({ id, options }) => {
                let fn = main.modules.middlewares[id];
                if (!fn)
                    return;
                debug_1.default('use super middleware', id);
                main.app.use(fn(options, main));
            });
            main.debug('use internal middleware');
            main.app.use(async (ctx, next) => {
                ctx.state.env = env;
                ctx.main = main;
                ctx.service = main;
                try {
                    await next();
                    if (ctx.status === 404 && !ctx.body)
                        main.error(404);
                }
                catch (error) {
                    let expose = error.expose || error instanceof alaska_1.NormalError || false;
                    let code = error.code || error.status;
                    let message = 'Internal Server Error';
                    if (code === 503) {
                        message = 'Service Unavailable';
                    }
                    if (expose) {
                        message = error.message;
                    }
                    if (ctx.locale) {
                        message = tr.locale(ctx.locale)(message);
                    }
                    let debugInfo;
                    if (env === 'development') {
                        debugInfo = error.stack;
                    }
                    if (!expose) {
                        console.error(error);
                    }
                    let status = ctx.status;
                    if (!ctx.body) {
                        if (ctx.state.jsonApi) {
                            ctx.body = {
                                error: message,
                                code,
                                debug: debugInfo
                            };
                        }
                        else {
                            ctx.body = `<h1>${message}</h1><div><pre>${debugInfo || ''}</pre></div>`;
                        }
                    }
                    if (error.status) {
                        ctx.status = error.status;
                    }
                    else if (status === 404) {
                        ctx.status = 500;
                    }
                }
            });
            await main.initMiddlewares();
        });
        collie(main, 'initMiddlewares', () => {
            main.debug('initMiddlewares');
            _(main.config.get('middlewares'))
                .map((options, id) => ({
                id,
                sort: options.sort || 0,
                options
            }))
                .filter((item) => item.sort < 10000)
                .orderBy(['sort'], ['desc'])
                .forEach(({ id, options }) => {
                let fn = main.modules.middlewares[id];
                if (!fn)
                    return;
                debug_1.default('use middleware', id);
                main.app.use(fn(options, main));
            });
        });
        let listenPromise = new Promise((resolve) => {
            collie(main, 'listen', async () => {
                main.debug('listen');
                let listenConfig = main.config.get('alaska-http.listen');
                if (!listenConfig)
                    throw new Error('Missing http listen configure [alaska-http.listen]');
                main.server.listen(listenConfig, () => {
                    main.debug('listen ready');
                    resolve();
                });
            });
        });
        main.pre('init', async () => {
            await main.initHttp();
        });
        main.post('start', async () => {
            routers.forEach((router) => {
                main.app.use(router.routes());
            });
            await main.listen();
        });
        main.pre('ready', async () => {
            await listenPromise;
        });
    }
}
HttpExtension.after = ['alaska-model'];
exports.default = HttpExtension;
