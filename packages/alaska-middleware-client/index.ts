import { MainService } from 'alaska';
import Client from 'alaska-client/models/Client';
import User from 'alaska-user/models/User';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { } from 'alaska-client';
import { ClientMiddlewareOptions } from '.';

export default function (options: ClientMiddlewareOptions, main: MainService): Middleware {
  options = options || {};
  return async function clientMiddleware(ctx: Context, next): Promise<void> {
    if (!ctx.client) {
      let token = '';
      if (options.getToken) {
        token = options.getToken(ctx);
      } else {
        token = ctx.headers[options.tokenHeader || 'client-token'];
      }
      if (token) {
        let client = await Client.findOne({ token });

        // 删除过期
        if (client && client.expiredAt && client.expiredAt < new Date()) {
          await client.remove();
          client = null;
        }

        if (options.extendTime && client && client.expiredAt < new Date(Date.now() + options.extendTime)) {
          client.expiredAt = new Date(client.expiredAt.getTime() + options.extendTime);
          await client.save();
        }

        if (client) {
          ctx.client = client;
          if (client.user && !ctx.user) {
            ctx.user = await User.findById(client.user);
          }
        }
      }
    }
    await next();
  };
}
