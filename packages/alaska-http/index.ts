import * as collie from 'collie';
import * as Koa from 'koa';
import * as KoaQS from 'koa-qs';
import * as Router from 'koa-router';
import * as _ from 'lodash';
import { MainService, Extension } from 'alaska';
import debug from './debug';
import { } from 'alaska-http';

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
        router = new Router({
          prefix
        });
        routers.set(prefix, router);
      }
      return router;
    };

    collie(main, 'initHttp', () => {
      main.debug('initHttp');
      if (!main.app) {
        main.app = new Koa();
        main.app.env = main.config.get('env');
        main.app.proxy = main.config.get('alaska-http.proxy');
        main.app.subdomainOffset = main.config.get('alaska-http.subdomainOffset');
        KoaQS(main.app);
      }
      main.app.use(async (ctx, next) => {
        ctx.state.env = main.config.get('env');
        try {
          await next();
        } catch (error) {
          console.error(error);
          ctx.body = {
            code: error.code,
            error: error.message
          };
          ctx.status = error.code || 500;
        }
        if (ctx.status === 404 && !ctx.body) {
          ctx.body = {
            code: 404,
            error: 'Not Found'
          };
          ctx.status = 404;
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
        .orderBy(['sort', 'desc'])
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
        let server = main.app.listen(listenConfig, () => {
          main.debug('listen ready');
          resolve();
        });
        return server;
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
