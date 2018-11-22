import { MainService, NormalError } from 'alaska';
import {
  UserMiddlewareOptions,
} from 'alaska-middleware-user';
import User from 'alaska-user/models/User';
import Encryption from 'alaska-user/encryption';
import { Context } from 'alaska-http';
import { } from 'alaska-middleware-session';
import { Middleware } from 'koa';

export default function (options: UserMiddlewareOptions, main: MainService): Middleware {
  let key: string = main.config.get('autoLogin.key');
  let secret: string = main.config.get('autoLogin.secret');
  let encryption: Encryption;
  if (key && secret) {
    encryption = new Encryption(secret);
  }

  return async function userMiddleware(ctx: Context, next): Promise<void> {
    if (!ctx.session) {
      await next();
      return;
    }
    let userId = ctx.session.userId;
    ctx.user = null;

    if (userId) {
      try {
        ctx.user = await User.findById(userId);
      } catch (e) {
        console.error(e.stack);
      }
    }
    /*eslint max-depth: [2, 6]*/
    if (!ctx.user && encryption) {
      let cookie = ctx.cookies.get(key);
      if (cookie) {
        try {
          let data = encryption.decrypt(Buffer.from(cookie, 'base64')).toString();
          if (data) {
            let arr = data.split(':').filter((d) => d);
            if (arr.length >= 2) {
              let user: User = await User.findById(arr[0]);
              if (!user) {
                throw new Error('user not found');
              }
              if (arr[1] === encryption.hash(user.password)) {
                ctx.user = user;
                ctx.session.userId = user._id.toString();
              } else {
                ctx.cookies.set(key);
              }
            }
          } else {
            ctx.cookies.set(key);
          }
        } catch (error) {
          console.error(error.stack);
          ctx.cookies.set(key);
        }
      }
    }
    await next();
  };
}
