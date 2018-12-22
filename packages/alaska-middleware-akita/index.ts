import { MainService } from 'alaska';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { } from 'alaska-client';
import { AkitaMiddlewareOptions } from '.';

export default function (options: AkitaMiddlewareOptions, main: MainService): Middleware {
  return function clientMiddleware(ctx: Context, next): any {
    if (ctx.method === 'POST' && ctx.headers['akita-method'] === 'PATCH') {
      ctx.method = 'PATCH';
    }
    return next();
  };
}
