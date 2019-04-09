import { MainService } from 'alaska';
import Client from 'alaska-client/models/Client';
import User from 'alaska-user/models/User';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { } from 'alaska-client';
import { ClientMiddlewareConfig } from '.';

export default function (config: ClientMiddlewareConfig, main: MainService): Middleware {
  config = config || {};
  return async function clientMiddleware(ctx: Context, next): Promise<void> {
    if (!ctx.client) {
      let token = '';
      if (config.getToken) {
        token = config.getToken(ctx);
      } else {
        token = ctx.headers[config.tokenHeader || 'client-token'];
      }
      if (token) {
        let client = await Client.findOne({ token }).session(ctx.dbSession);

        // 删除过期
        if (client && client.expiredAt && client.expiredAt < new Date()) {
          await client.remove();
          client = null;
        }

        if (config.extendTime && client && client.expiredAt < new Date(Date.now() + config.extendTime)) {
          client.expiredAt = new Date(client.expiredAt.getTime() + config.extendTime);
          await client.save({ session: ctx.dbSession });
        }

        if (client) {
          ctx.client = client;
          if (client.user && !ctx.user) {
            ctx.user = await User.findById(client.user).session(ctx.dbSession);
          }
        }
      }
    }
    await next();
  };
}
