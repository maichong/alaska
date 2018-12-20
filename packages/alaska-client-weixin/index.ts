import { Plugin } from 'alaska';
import { ClientService } from 'alaska-client';
import * as libwx from 'libwx';
import { ConfigData } from '.';

export default class WeixinClientPlugin extends Plugin {
  constructor(service: ClientService) {
    super(service);

    service.pre('start', () => {
      let config: ConfigData = service.main.config.get('alaska-client-weixin');
      if (!config) throw new Error('Missing config [alaska-client-weixin]');
      if (!config.appid) throw new Error('Missing config [alaska-client-weixin.appid]');
      if (!config.secret) throw new Error('Missing config [alaska-client-weixin.secret]');

      let wx = libwx.getInstance('alaska-client-weixin');
      wx.init({
        appid: config.appid,
        secret: config.secret
      });

      service.wx = wx;
    });
  }
}
