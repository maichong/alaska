"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = require("alaska-client/models/Client");
const User_1 = require("alaska-user/models/User");
function default_1(config, main) {
    config = config || {};
    return async function clientMiddleware(ctx, next) {
        if (!ctx.client) {
            let token = '';
            if (config.getToken) {
                token = config.getToken(ctx);
            }
            else {
                token = ctx.headers[config.tokenHeader || 'client-token'];
            }
            if (token) {
                let client = await Client_1.default.findOne({ token }).session(ctx.dbSession);
                if (client && client.expiredAt && client.expiredAt < new Date()) {
                    await client.remove();
                    client = null;
                }
                if (config.extendTime && client && client.expiredAt < new Date(Date.now() + config.extendTime)) {
                    client.expiredAt = new Date(client.expiredAt.getTime() + config.extendTime);
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
