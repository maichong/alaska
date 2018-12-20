import { Context } from 'alaska-http';
import Client from '../models/Client';

/**
 * 注册设别接口
 * 客户端启动时必须首先调用此接口，如果客户端已经存在token，也许要调用此接口验证token是否可用
 * @http-body {string} [deviceId]
 * @http-body {string} [token]
 * @http-body {string} [platform]
 */
export async function create(ctx: Context) {
  const { deviceId, token, platform } = ctx.state.body || ctx.request.body;
  let client: Client;
  if (deviceId && token) {
    client = await Client.findOne({ deviceId, token });
  } else if (token) {
    client = await Client.findOne({ token });
  }
  if (!client) {
    client = new Client();
  }

  client.deviceId = deviceId;
  client.platform = platform;

  await client.save();

  ctx.body = client.data();
}
