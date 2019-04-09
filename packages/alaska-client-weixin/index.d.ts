import { Plugin, ObjectMap, PluginConfig } from 'alaska';
import { Weixin } from 'libwx';

declare module 'alaska-client' {
  interface ClientService {
    wxPlatforms: {
      [platform: string]: Weixin;
    };
  }
}

export interface WeixinClientConfig {
  channel: 'jssdk' | 'app' | 'wxapp';
  appid: string;
  secret: string;
  /**
   * 自动注册用户
   */
  autoRegiterUser?: boolean;
  /**
   * 自动更新用户openid
   * 当用户在其他微信上登录后，自动更新 user.openid 字段为新微信
   */
  autoUpdateOpenId?: boolean;
  /**
   * 启用 unionid，代替 openid
   * 自动注册时，使用 unionid 作为 username
   * 并且，使用 unionid 字段作为用户查询字段
   */
  useUnionid?: boolean;
  /**
   * 用户模型字段映射
   */
  userFieldsMap: {
    // openid 字段，默认 openid
    openid?: string;
    // unionid 字段，默认 unionid
    unionid?: string;
    // access_token 字段，默认 wxAccessToken
    access_token?: string;
    // expires_in 字段，默认 wxAccessTokenExpiredAt
    expires_in?: string;
    // refresh_token 字段，默认 wxRefreshToken
    refresh_token?: string;
    // 小程序端 session_key 字段，默认 wxSessionKey
    session_key?: string;
  };
}

export interface WeixinClientPluginConfig extends PluginConfig {
  platforms: {
    [platform: string]: WeixinClientConfig;
  };
}

export default class WeixinClientPlugin extends Plugin<WeixinClientPluginConfig> {
}
