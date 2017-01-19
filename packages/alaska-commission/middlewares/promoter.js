//@flow

export default function (options: Object): Function {
  let queryKey = options.queryKey || 'p';
  let cookieOptions = options.cookieOptions;
  return function promoterMiddleware(ctx: Alaska$Context, next: Function): Function {
    let promoter = ctx.query[queryKey];
    if (promoter) {
      ctx.cookies.set('promoter', promoter, cookieOptions);
    }
    return next();
  };
};
