import { Sled } from 'alaska-sled';
import * as escape from 'escape-string-regexp';
import User from '../models/User';
import Encryption from '../encryption';
import { } from 'alaska-middleware-session';
import service, { LoginParams } from '..';

let encryption: Encryption;

/**
 * 登录
 */
export default class Login extends Sled<LoginParams, User> {
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
  async exec(params: LoginParams): Promise<User> {
    let user: User = params.user;

    if (!user) {
      user = await User.findOne({
        username: new RegExp(`^${escape(params.username)}$`, 'i')
      });
      if (!user) {
        service.error('Incorrect username or password', 1101);
      }
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

    if (params.remember !== false) {
      const autoLogin = service.main.config.get('autoLogin');
      if (autoLogin && autoLogin.key && autoLogin.secret) {
        if (!encryption) {
          encryption = new Encryption(autoLogin.secret);
        }
        let cookie = `${user.id}:${encryption.hash(user.password)}:${Date.now().toString(36)}`;
        cookie = encryption.encrypt(cookie).toString('base64');
        params.ctx.cookies.set(autoLogin.key, cookie, autoLogin);
      }
    }

    return user;
  }
}
