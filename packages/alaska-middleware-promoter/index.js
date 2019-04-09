"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(config, main) {
    let queryKey = config.queryKey || 'p';
    let cookieOptions = config.cookieOptions;
    return function promoterMiddleware(ctx, next) {
        let promoter = ctx.query[queryKey];
        if (promoter) {
            ctx.cookies.set('p', promoter, cookieOptions);
        }
        return next();
    };
}
exports.default = default_1;
