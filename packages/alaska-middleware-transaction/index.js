"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathToRegexp = require("path-to-regexp");
function default_1(config) {
    const ignoreMethods = config.ignoreMethods || [];
    let ignores = null;
    function convert(input) {
        if (typeof input === 'string') {
            ignores.push(pathToRegexp(input));
        }
        else if (input instanceof RegExp || typeof input === 'function') {
            ignores.push(input);
        }
        else {
            throw new Error(`Invalid transaction ignore option: ${String(input)}`);
        }
    }
    if (config.ignore) {
        ignores = [];
        if (Array.isArray(config.ignore)) {
            config.ignore.forEach(convert);
        }
        else {
            convert(config.ignore);
        }
    }
    return async function transactionMiddleware(ctx, next) {
        function initSession() {
            if (ignoreMethods.includes(ctx.method)) {
                return false;
            }
            if (ignores) {
                for (let reg of ignores) {
                    if ((reg instanceof RegExp && reg.test(ctx.path))
                        || (typeof reg === 'function' && reg(ctx.path, ctx))) {
                        return false;
                    }
                }
            }
            return true;
        }
        if (initSession()) {
            ctx.dbSession = await ctx.service.db.startSession();
            await ctx.dbSession.startTransaction();
        }
        try {
            await next();
        }
        catch (error) {
            if (!ctx.dbSession)
                throw error;
            if (ctx.dbSession.inTransaction()) {
                await ctx.dbSession.abortTransaction();
            }
            if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') >= 0) {
                ctx.body = null;
                ctx.throw(503);
            }
            else {
                throw error;
            }
        }
        if (!ctx.dbSession)
            return;
        if (!ctx.dbSession.inTransaction())
            return;
        try {
            await ctx.dbSession.commitTransaction();
        }
        catch (error) {
            ctx.body = null;
            ctx.throw(503);
        }
    };
}
exports.default = default_1;
