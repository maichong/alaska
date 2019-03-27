"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("alaska-client/models/Client");
const User_1 = require("alaska-user/models/User");
function default_1(options, main) {
    options = options || {};
    return async function clientMiddleware(ctx, next) {
        if (!ctx.client) {
            let token = '';
            if (options.getToken) {
                token = options.getToken(ctx);
            }
            else {
                token = ctx.headers[options.tokenHeader || 'client-token'];
            }
            if (token) {
                let client = await Client_1.default.findOne({ token }).session(ctx.dbSession);
                if (client && client.expiredAt && client.expiredAt < new Date()) {
                    await client.remove();
                    client = null;
                }
                if (options.extendTime && client && client.expiredAt < new Date(Date.now() + options.extendTime)) {
                    client.expiredAt = new Date(client.expiredAt.getTime() + options.extendTime);
                    await client.save({ session: ctx.dbSession });
                }
                if (client) {
                    ctx.client = client;
                    if (client.user && !ctx.user) {
                        ctx.user = await User_1.default.findById(client.user).session(ctx.dbSession);
                    }
                }
            }
        }
        await next();
    };
}
exports.default = default_1;
