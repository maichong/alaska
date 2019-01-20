import { ObjectMap } from 'alaska';
import clientService from 'alaska-client';
import Register from 'alaska-user/sleds/Register';
import User from 'alaska-user/models/User';
import Client from 'alaska-client/models/Client';
import { Context } from 'alaska-http';
import { ConfigData } from '..';

/**
 * 注册设备接口的前置中间件，需要将 wxCode 转换为 deviceId
 */
export async function create(ctx: Context, next: Function) {
  let { deviceId, platform, wxCode } = ctx.state.body || ctx.request.body;
  if (!wxCode) {
    await next();
    return;
  }
  if (!platform) clientService.error('platform is required!');
  let wx = clientService.wxPlatforms[platform];
  if (!wx || !wx.getAccessToken) clientService.error('invalid platform!');

  let configMap: ObjectMap<ConfigData> = clientService.main.config.get('alaska-client-weixin');
  let config = configMap[platform];
  if (!config) clientService.error('invalid platform!');
  let userFieldsMap = config.userFieldsMap || {} as typeof config.userFieldsMap;

  let info = await wx.getAccessToken(wxCode);
  deviceId = info.openid;

  let client = await Client.findOne({ deviceId }).session(ctx.dbSession);

  // 删除过期
  if (client && client.expiredAt && client.expiredAt < new Date()) {
    await client.remove();
    client = null;
  }

  // 需重新注册客户机信息
  if (!client) {
    client = new Client();
  }
  client.set({ deviceId, platform });

  if (!client.user) {
    // 如果该设备还未绑定用户

    // 查询用户是否已经注册
    let userFilter: any = {};
    if (config.useUnionid && info.unionid) {
      userFilter[userFieldsMap.unionid || 'unionid'] = info.unionid;
    } else {
      userFilter[userFieldsMap.openid || 'openid'] = info.openid;
    }

    let user = await User.findOne(userFilter).session(ctx.dbSession);
    if (user) {
      // 用户已经注册，直接绑定
      client.user = user._id;
    } else if (config.autoRegiterUser) {
      // 自动注册User
      let params: any = {
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
        // 公众号平台
        params[userFieldsMap.access_token || 'wxAccessToken'] = info.access_token;
        params[userFieldsMap.access_token || 'wxAccessTokenExpiredAt'] = new Date(Date.now() + (info.expires_in * 1000));
        params[userFieldsMap.refresh_token || 'wxRefreshToken'] = info.refresh_token;
      }

      if (info.session_key) {
        // 小程序平台
        params[userFieldsMap.session_key || 'wxSessionKey'] = info.session_key;
      }

      user = await Register.run(params, { dbSession: ctx.dbSession });

      client.user = user._id;
    }
  }

  await client.save({ session: ctx.dbSession });

  ctx.body = client.data();
}
