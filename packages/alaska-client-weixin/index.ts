import * as _ from 'lodash';
import { Plugin } from 'alaska';
import { ClientService } from 'alaska-client';
import User from 'alaska-user/models/User';
import { Weixin } from 'libwx';
import { WeixinClientPluginConfig, WeixinClientConfig } from '.';

export default class WeixinClientPlugin extends Plugin<WeixinClientPluginConfig> {
  constructor(pluginConfig: WeixinClientPluginConfig, service: ClientService) {
    super(pluginConfig, service);

    service.wxPlatforms = {};
    if (_.isEmpty(pluginConfig.platforms)) throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.platforms]`);

    service.pre('start', () => {
      for (let key of Object.keys(pluginConfig.platforms)) {
        let config: WeixinClientConfig = pluginConfig.platforms[key];
        if (!config.appid) throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.platforms.${key}.appid]`);
        if (!config.secret) throw new Error(`Missing config [alaska-client/plugins.alaska-client-weixin.platforms.${key}.secret]`);

        let userFieldsMap = config.userFieldsMap || {} as typeof config.userFieldsMap;
        if (config.useUnionid) {
          // 检查 Unionid 字段是否存在
          let unionid = userFieldsMap.unionid || 'unionid';
          if (!User._fields[unionid]) throw new Error(`User.fields.${unionid} is not exists!`);
        } else {
          // 检查 openid 字段是否存在
          let openid = userFieldsMap.openid || 'openid';
          if (!User._fields[openid]) throw new Error(`User.fields.${openid} is not exists!`);
        }

        service.wxPlatforms[key] = new Weixin({
          channel: config.channel,
          appid: config.appid,
          secret: config.secret
        });
      }
    });
  }
}
