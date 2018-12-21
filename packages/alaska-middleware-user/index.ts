import { MainService, NormalError } from 'alaska';
import {
  UserMiddlewareOptions,
} from 'alaska-middleware-user';
import User from 'alaska-user/models/User';
import Login from 'alaska-user/sleds/Login';
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
    if (!ctx.session || ctx.user) {
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
    if (!ctx.user && options.enableBasicAuth && ctx.headers.authorization) {
      try {
        let [type, code] = ctx.headers.authorization.split(' ');
        if (type === 'Basic' && code) {
          code = Buffer.from(code, 'base64').toString() || '';
          let index = code.indexOf(':');
          let username = code.substr(0, index);
          let password = code.substr(index + 1);
          ctx.user = await Login.run({ username, password, remember: false, channel: 'basic-auth' });
        } else {
          throw new Error('invalid authorization');
        }
      } catch (error) {
        throw new NormalError('Base Auth Field', 401);
      }
    }
    await next();
  };
}
