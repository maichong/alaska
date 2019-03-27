"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(options, main) {
    let queryKey = options.queryKey || 'p';
    let cookieOptions = options.cookieOptions;
    return function promoterMiddleware(ctx, next) {
        let promoter = ctx.query[queryKey];
        if (promoter) {
            ctx.cookies.set('p', promoter, cookieOptions);
        }
        return next();
    };
}
exports.default = default_1;
