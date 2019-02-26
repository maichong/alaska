import { MainService } from 'alaska';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { PromoterMiddlewareOptions } from '.';

export default function (options: PromoterMiddlewareOptions, main: MainService): Middleware {
  let queryKey = options.queryKey || 'p';
  let cookieOptions = options.cookieOptions;
  return function promoterMiddleware(ctx: Context, next: Function): Function {
    let promoter = ctx.query[queryKey];
    if (promoter) {
      ctx.cookies.set('p', promoter, cookieOptions);
    }
    return next();
  };
}
