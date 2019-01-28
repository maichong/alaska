import * as collie from 'collie';
import * as tr from 'grackle';
import * as http from 'http';
import * as Koa from 'koa';
import * as KoaQS from 'koa-qs';
import * as KoaRouter from 'koa-router';
import * as _ from 'lodash';
import { MainService, Extension, NormalError } from 'alaska';
import debug from './debug';
import { Router } from 'alaska-http';

export default class HttpExtension extends Extension {
  static after = ['alaska-model'];

  constructor(main: MainService) {
    super(main);

    let routers: Map<string, Router> = new Map();

    main.getRouter = (prefix: string) => {
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

    collie(main, 'initHttp', () => {
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
      main.app.use(async (ctx, next) => {
        ctx.state.env = env;
        ctx.main = main;
        ctx.service = main;
        try {
          await next();
          if (ctx.status === 404 && !ctx.body) main.error(404);
        } catch (error) {
          let expose = error.expose || error instanceof NormalError || false;
          let message = expose ? error.message : 'Internal Server Error';
          if (ctx.locale) {
            message = tr.locale(ctx.locale)(message);
          }
          let debugInfo;
          if (env === 'development') {
            debugInfo = error.stack;
          }
          if (!expose) {
            // 内部错误，输出到控制台
            console.error(error);
          }
          let status = ctx.status;
          if (!ctx.body) {
            if (ctx.state.jsonApi) {
              ctx.body = {
                error: message,
                code: error.code,
                debug: debugInfo
              };
            } else {
              // TODO: 渲染错误页面
              ctx.body = `<h1>${message}</h1><div><pre>${debugInfo || ''}</pre></div>`;
            }
          }
          if (error.status) {
            ctx.status = error.status;
          } else if (status === 404) {
            ctx.status = 500;
          }
        }
      });
    });

    collie(main, 'initMiddlewares', () => {
      main.debug('initMiddlewares');
      _(main.config.get('middlewares'))
        .map((options, id) => ({
          id,
          sort: options.sort || 0,
          options
        }))
        .orderBy(['sort'], ['desc'])
        .forEach(({ id, options }) => {
          let fn = main.modules.middlewares[id];
          if (!fn) return;
          debug('use middleware', id);
          main.app.use(fn(options, main));
        });
    });

    let listenPromise = new Promise((resolve) => {
      collie(main, 'listen', async () => {
        main.debug('listen');
        let listenConfig = main.config.get('alaska-http.listen');
        if (!listenConfig) throw new Error('Missing http listen configure [alaska-http.listen]');
        main.server.listen(listenConfig, () => {
          main.debug('listen ready');
          resolve();
        });
      });
    });

    main.pre('init', async () => {
      await main.initHttp();
      await main.initMiddlewares();
    });

    main.post('start', async () => {
      routers.forEach((router) => {
        main.app.use(router.routes());
      });
      await main.listen();
    });

    main.pre('ready', async () => {
      // 拦截ready事件，等待listen成功
      await listenPromise;
    });
  }
}
