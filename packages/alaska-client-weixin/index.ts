import { Plugin, ObjectMap } from 'alaska';
import { ClientService } from 'alaska-client';
import User from 'alaska-user/models/User';
import { Weixin } from 'libwx';
import { ConfigData } from '.';

export default class WeixinClientPlugin extends Plugin {
  constructor(service: ClientService) {
    super(service);

    service.wxPlatforms = {};

    service.pre('start', () => {
      let configMap: ObjectMap<ConfigData> = service.main.config.get('alaska-client-weixin');
      if (!configMap) throw new Error('Missing config [alaska-client-weixin]');

      for (let key of Object.keys(configMap)) {
        let config = configMap[key];
        if (!config.appid) throw new Error(`Missing config [alaska-client-weixin.${key}.appid]`);
        if (!config.secret) throw new Error(`Missing config [alaska-client-weixin.${key}.secret]`);

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
          platform: config.platform,
          appid: config.appid,
          secret: config.secret
        });
      }
    });
  }
}
