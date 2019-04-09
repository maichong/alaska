"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_client_1 = require("alaska-client");
const Register_1 = require("alaska-user/sleds/Register");
const User_1 = require("alaska-user/models/User");
const Client_1 = require("alaska-client/models/Client");
async function create(ctx, next) {
    let { deviceId, platform, wxCode } = ctx.state.body || ctx.request.body;
    if (!wxCode) {
        await next();
        return;
    }
    if (!platform)
        alaska_client_1.default.error('platform is required!');
    let wx = alaska_client_1.default.wxPlatforms[platform];
    if (!wx || !wx.getAccessToken)
        alaska_client_1.default.error('invalid platform!');
    let platforms = alaska_client_1.default.plugins.get('alaska-client-weixin').config.platforms;
    let config = platforms[platform];
    if (!config)
        alaska_client_1.default.error('invalid platform!');
    let userFieldsMap = config.userFieldsMap || {};
    let info = await wx.getAccessToken(wxCode);
    deviceId = info.openid;
    let client = await Client_1.default.findOne({ deviceId }).session(ctx.dbSession);
    if (client && client.expiredAt && client.expiredAt < new Date()) {
        await client.remove();
        client = null;
    }
    if (!client) {
        client = new Client_1.default();
    }
    client.set({ deviceId, platform });
    if (!client.user) {
        let userFilter = {};
        if (config.useUnionid && info.unionid) {
            userFilter[userFieldsMap.unionid || 'unionid'] = info.unionid;
        }
        else {
            userFilter[userFieldsMap.openid || 'openid'] = info.openid;
        }
        let user = await User_1.default.findOne(userFilter).session(ctx.dbSession);
        if (user) {
            client.user = user._id;
        }
        else if (config.autoRegiterUser) {
            let params = {
                username: info.openid,
                password: info.openid + Math.random().toString(),
                [userFieldsMap.openid || 'openid']: info.openid,
            };
            if (config.useUnionid && info.unionid) {
                params.username = info.unionid;
            }
            if (info.unionid) {
                params[userFieldsMap.unionid || 'unionid'] = info.unionid;
            }
            if (info.access_token) {
                params[userFieldsMap.access_token || 'wxAccessToken'] = info.access_token;
                params[userFieldsMap.access_token || 'wxAccessTokenExpiredAt'] = new Date(Date.now() + (info.expires_in * 1000));
                params[userFieldsMap.refresh_token || 'wxRefreshToken'] = info.refresh_token;
            }
            if (info.session_key) {
                params[userFieldsMap.session_key || 'wxSessionKey'] = info.session_key;
            }
            user = await Register_1.default.run(params, { dbSession: ctx.dbSession });
            client.user = user._id;
        }
    }
    await client.save({ session: ctx.dbSession });
    let data = client.data();
    data.user = null;
    if (client.user) {
        let user = await User_1.default.findById(client.user).session(ctx.dbSession);
        let openidField = userFieldsMap.openid || 'openid';
        let oldOpenId = user.get(openidField);
        if (User_1.default._fields[openidField] && (!oldOpenId || (config.autoUpdateOpenId && oldOpenId !== deviceId))) {
            user.set(openidField, deviceId);
            await user.save({ session: ctx.dbSession });
        }
        if (user) {
            data.user = user.data('info');
        }
    }
    ctx.body = data;
}
exports.create = create;
