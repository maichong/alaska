"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
function default_1(router) {
    let config = __1.default.config.get('superMode');
    router.all('(.*)', (ctx, next) => {
        ctx.service = __1.default;
        ctx.state.jsonApi = true;
        if (config) {
            ctx.state.superMode = setSuperMode(ctx);
        }
        return next();
    });
    function has(array, value) {
        return Array.isArray(array) ? array.indexOf(value) > -1 : array === value;
    }
    function setSuperMode(ctx) {
        let superMode = ctx.state.superMode;
        if (superMode)
            return true;
        if (config.cookie && ctx.cookies.get(config.cookie))
            return true;
        if (ctx.user) {
            if (config.userId && has(config.userId, ctx.user.id))
                return true;
            if (config.username && has(config.username, ctx.user.username))
                return true;
            if (config.email && has(config.email, ctx.user.email))
                return true;
        }
        return false;
    }
}
exports.default = default_1;
