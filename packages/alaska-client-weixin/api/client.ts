import clientService from 'alaska-client';
import Client from 'alaska-client/models/Client';
import { Context } from 'alaska-http';
import { } from '..';

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

  // 需重新注册客户机信息
  if (!client) {
    client = new Client();
  }
  client.set({ deviceId, platform });
  await client.save();

  ctx.body = client.data();
}
