"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(options, main) {
    return function clientMiddleware(ctx, next) {
        if (ctx.method === 'PUT' && ctx.headers['akita-method'] === 'PATCH') {
            ctx.method = 'PATCH';
        }
        return next();
    };
}
exports.default = default_1;
