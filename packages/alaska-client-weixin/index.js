"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const User_1 = require("alaska-user/models/User");
const libwx_1 = require("libwx");
class WeixinClientPlugin extends alaska_1.Plugin {
    constructor(service) {
        super(service);
        service.wxPlatforms = {};
        service.pre('start', () => {
            let configMap = service.main.config.get('alaska-client-weixin');
            if (!configMap)
                throw new Error('Missing config [alaska-client-weixin]');
            for (let key of Object.keys(configMap)) {
                let config = configMap[key];
                if (!config.appid)
                    throw new Error(`Missing config [alaska-client-weixin.${key}.appid]`);
                if (!config.secret)
                    throw new Error(`Missing config [alaska-client-weixin.${key}.secret]`);
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
