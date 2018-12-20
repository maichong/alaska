import { Plugin } from 'alaska';
import * as libwx from 'libwx';

declare module 'alaska-client' {
  interface ClientService {
    wx: libwx.Weixin;
  }
}

export interface ConfigData {
  appid: string;
  secret: string;
  autoRegiterUser?: boolean;
  /**
   * 用户模型字段映射
   */
  userFieldsMap: {
    // openid 字段，默认 openid
    openid: string;
    // unionid 字段，默认 unionid
    unionid: string;
    // access_token 字段，默认 wxAccessToken
    access_token: string;
    // expires_in 字段，默认 wxAccessTokenExpiredAt
    expires_in: string;
    // refresh_token 字段，默认 wxRefreshToken
    refresh_token: string;
  }
}

export default class WeixinClientPlugin extends Plugin {
}
