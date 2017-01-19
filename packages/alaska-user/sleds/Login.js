// @flow

import alaska, { Sled, utils } from 'alaska';
import service from '../';
import User from '../models/User';
import Encryption from '../lib/encryption';

const autoLogin = alaska.main.config('autoLogin');
let encryption;
if (autoLogin && autoLogin.key && autoLogin.secret) {
  encryption = new Encryption(autoLogin.secret);
}

/**
 * 登录
 */
export default class Login extends Sled {
  /**
   * 登录失败将抛出异常
   * @param {Object}   params
   * @param {Context}  params.ctx
   * @param {User}     [params.user]
   * @param {string}   params.username
   * @param {string}   params.password
   * @param {boolean}  [params.remember]
   * @returns {User}
   */
  async exec(params: {
    ctx: Alaska$Context;
    user?: User;
    username: string;
    password: string;
    remember?: boolean
  }): Promise<User> {
    let user: ?User = params.user;

    if (!user) {
      // $Flow
      let u: User = await User.findOne({
        username: new RegExp('^' + utils.escapeRegExp(params.username) + '$', 'i')
      });
      if (!u) {
        service.error('Incorrect username or password', 1101);
      }
      user = u;
    }

    //params中指定了user 并且密码为空
    //免密码登录
    if (!params.user || params.password) {
      let success = await user.auth(params.password);
      if (!success) {
        service.error('Incorrect username or password', 1101);
      }
    }

    params.ctx.session.userId = user.id;

    if (params.remember !== false && encryption) {
      let cookie = user.id + ':' + encryption.hash(user.password) + ':' + Date.now().toString(36);
      cookie = encryption.encrypt(cookie).toString('base64');
      params.ctx.cookies.set(autoLogin.key, cookie, autoLogin);
    }

    return user;
  }
}
