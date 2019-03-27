"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_http_1 = require("alaska-http");
const User_1 = require("alaska-user/models/User");
const Client_1 = require("../models/Client");
async function create(ctx) {
    const { deviceId, token, platform } = ctx.state.body || ctx.request.body;
    let client = ctx.client;
    if (!client) {
        if (deviceId && token) {
            client = await Client_1.default.findOne({ deviceId, token });
        }
        else if (token) {
            client = await Client_1.default.findOne({ token });
        }
    }
    if (client && client.expiredAt && client.expiredAt < new Date()) {
        await client.remove();
        client = null;
    }
    if (!client) {
        client = new Client_1.default();
    }
    client.deviceId = deviceId;
    client.platform = platform;
    await client.save({ session: ctx.dbSession });
    let data = client.data();
    data.user = null;
    if (client.user) {
        let user = await User_1.default.findById(client.user).session(ctx.dbSession);
        if (user) {
            data.user = user.data('info');
        }
    }
    ctx.body = data;
}
exports.create = create;
alaska_http_1.GET(show);
function show(ctx) {
    if (ctx.client) {
        ctx.body = ctx.client.data();
    }
    else {
        ctx.body = {};
    }
}
exports.default = show;
