"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const User_1 = require("alaska-user/models/User");
const libwx_1 = require("libwx");
class WeixinClientPlugin extends alaska_1.Plugin {
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        service.wxPlatforms = {};
        if (_.isEmpty(pluginConfig.platforms))
            throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.platforms]`);
        service.pre('start', () => {
            for (let key of Object.keys(pluginConfig.platforms)) {
                let config = pluginConfig.platforms[key];
                if (!config.appid)
                    throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.${key}.appid]`);
                if (!config.secret)
                    throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.${key}.secret]`);
                let userFieldsMap = config.userFieldsMap || {};
                if (config.useUnionid) {
                    let unionid = userFieldsMap.unionid || 'unionid';
                    if (!User_1.default._fields[unionid])
                        throw new Error(`User.fields.${unionid} is not exists!`);
                }
                else {
                    let openid = userFieldsMap.openid || 'openid';
                    if (!User_1.default._fields[openid])
                        throw new Error(`User.fields.${openid} is not exists!`);
                }
                service.wxPlatforms[key] = new libwx_1.Weixin({
                    channel: config.channel,
                    appid: config.appid,
                    secret: config.secret
                });
            }
        });
    }
}
exports.default = WeixinClientPlugin;
