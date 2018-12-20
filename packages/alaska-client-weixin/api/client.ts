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
  let res = await clientService.wx.getAccessToken(wxCode);
  deviceId = res.openid;
  if (!platform) {
    platform = 'weixin';
  }
  let client = await Client.findOne({ deviceId });

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

  let user = await User.findOne({ openid: res.openid });
  if (user) {
    client.user = user._id;
  } else {
    let config: ConfigData = clientService.main.config.get('alaska-client-weixin');
    if (config && config.autoRegiterUser) {
      let userFieldsMap = config.userFieldsMap || {} as typeof config.userFieldsMap;
      // 自动注册User
      user = await Register.run({
        username: res.openid,
        password: res.openid + Math.random().toString(),
        [userFieldsMap.openid || 'openid']: res.openid,
        [userFieldsMap.unionid || 'unionid']: res.unionid,
        [userFieldsMap.access_token || 'wxAccessToken']: res.access_token,
        [userFieldsMap.access_token || 'wxAccessTokenExpiredAt']: new Date(Date.now() + (res.expires_in * 1000)),
        [userFieldsMap.refresh_token || 'wxRefreshToken']: res.refresh_token
      });
      client.user = user._id;
    }
  }

  await client.save();

  ctx.body = client.data();
}
