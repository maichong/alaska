// @flow

/* eslint consistent-return:0 */

import alaska, { NormalError } from 'alaska';
import User from '../models/User';
import Encryption from '../utils/encryption';

export default function () {
  let key = alaska.main.getConfig('autoLogin.key');
  let secret = alaska.main.getConfig('autoLogin.secret');
  let encryption;
  if (key && secret) {
    encryption = new Encryption(secret);
  }

  return async function userMiddleware(ctx: Alaska$Context, next: Function): Promise<void> {
    if (!ctx.session) return next();
    let userId = ctx.session.userId;

    // $Flow
    ctx.user = null;

    ctx.checkAbility = (id) => {
      if (!ctx.user) {
        ctx.status = 403;
        ctx.error('Access Denied', 403);
      }
      // $Flow ctx.user 一定存在
      return ctx.user.hasAbility(id).then((has) => {
        if (!has) {
          ctx.status = 403;
          return Promise.reject(new NormalError('Access Denied', 403));
        }
      });
    };
    if (userId) {
      try {
        // $Flow
        ctx.user = await User.findById(userId);
      } catch (e) {
        console.error(e.stack);
      }
    }

    if (!ctx.user && encryption) {
      let cookie = ctx.cookies.get(key);
      if (cookie) {
        try {
          let data = encryption.decrypt(Buffer.from(cookie, 'base64')).toString();
          if (data) {
            data = data.split(':').filter((d) => d);
            if (data.length >= 2) {
              // $Flow
              let user: User = await User.findById(data[0]);
              if (!user) {
                throw new Error('user not found');
              }
              if (data[1] === encryption.hash(user.password)) {
                // $Flow
                ctx.user = user;
                ctx.session.userId = user.id;
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
