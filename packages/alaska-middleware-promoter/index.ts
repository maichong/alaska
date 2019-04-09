import { MainService } from 'alaska';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { PromoterMiddlewareConfig } from '.';

export default function (config: PromoterMiddlewareConfig, main: MainService): Middleware {
  let queryKey = config.queryKey || 'p';
  let cookieOptions = config.cookieOptions;
  return function promoterMiddleware(ctx: Context, next: Function): Function {
    let promoter = ctx.query[queryKey];
    if (promoter) {
      ctx.cookies.set('p', promoter, cookieOptions);
    }
    return next();
  };
}
