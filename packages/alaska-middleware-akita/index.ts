import { MainService } from 'alaska';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { } from 'alaska-client';
import { AkitaMiddlewareConfig } from '.';

export default function (config: AkitaMiddlewareConfig, main: MainService): Middleware {
  return function clientMiddleware(ctx: Context, next): any {
    if (ctx.method === 'PUT' && ctx.headers['akita-method'] === 'PATCH') {
      ctx.method = 'PATCH';
    }
    return next();
  };
}
