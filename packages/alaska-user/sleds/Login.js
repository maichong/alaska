// @flow

import alaska, { Sled, utils } from 'alaska';
import service from '../';
import User from '../models/User';
import Encryption from '../lib/encryption';

const autoLogin = alaska.main.config('autoLogin');
let encryption;
if (autoLogin.key && autoLogin.secret) {
  encryption = new Encryption(autoLogin.secret);
}

/**
 * 登录
 */
export default class Login extends Sled {
  /**
   * 登录失败将抛出异常
   * @param {Object}   data
   * @param {Context}  data.ctx
   * @param {User}     [data.user]
   * @param {string}   data.username
   * @param {string}   data.password
   * @param {boolean}  [data.remember]
   * @returns {User}
   */
  async exec(data: {
    ctx: Alaska$Context;
    user?: User;
    username: string;
    password: string;
    remember?: boolean
  }): Promise<User> {
    let user: ?User = data.user;

    if (!user) {
      // $Flow
      let u: User = await User.findOne({
        username: new RegExp('^' + utils.escapeRegExp(data.username) + '$', 'i')
      });
      if (!u) {
        service.error('Incorrect username or password', 1101);
      }
      user = u;
    }

    //data中指定了user 并且密码为空
    //免密码登录
    if (!data.user || data.password) {
      let success = await user.auth(data.password);
      if (!success) {
        service.error('Incorrect username or password', 1101);
      }
    }

    data.ctx.session.userId = user.id;

    if (data.remember !== false && encryption) {
      let cookie = user.id + ':' + encryption.hash(user.password) + ':' + Date.now().toString(36);
      cookie = encryption.encrypt(cookie).toString('base64');
      data.ctx.cookies.set(autoLogin.key, cookie, autoLogin);
    }

    return user;
  }
}
