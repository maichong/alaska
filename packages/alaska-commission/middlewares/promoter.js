'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  let queryKey = options.queryKey || 'p';
  let cookieOptions = options.cookieOptions;
  return function promoterMiddleware(ctx, next) {
    let promoter = ctx.query[queryKey];
    if (promoter) {
      ctx.cookies.set('promoter', promoter, cookieOptions);
    }
    return next();
  };
};