import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import * as escape from 'escape-string-regexp';
import * as _ from 'lodash';
import service, { RegisterParams } from '..';
import User from '../models/User';

/**
 * 用户注册
 */
export default class Register extends Sled<RegisterParams, User> {
  /**
   * @param {Object}  params
   * @param {Context} [params.ctx]
   * @param {User}    [params.user]
   * @param {string}  [params.username]
   * @param {string}  [params.password]
   *                 [...]
   * @returns {User}
   */
  async exec(params: RegisterParams): Promise<User> {
    let closeRegister = await settingsService.get('user.closeRegister');
    if (closeRegister) {
      let closeRegisterReason = await settingsService.get('user.closeRegisterReason');
      service.error(closeRegisterReason || 'Register closed');
    }
    let user = params.user;
    if (!user) {
      if (params.username) {
        let count = await User.countDocuments({
          username: new RegExp(`^${escape(params.username)}$`, 'i')
        }).session(this.dbSession);
        if (count) {
          service.error('Username is exists');
        }
      }
      if (params.email) {
        let emailCount = await User.countDocuments({
          email: new RegExp(`^${escape(params.email)}$`, 'i')
        }).session(this.dbSession);
        if (emailCount) {
          service.error('Email is exists');
        }
      }
      user = new User(_.omit(params, 'ctx', 'user'));
    }
    if (!user.roles) {
      user.roles = [];
    }
    if (!user.roles.includes('user')) {
      user.roles.push('user');
    }
    await user.save({ session: this.dbSession });

    if (params.ctx && params.ctx.session) {
      params.ctx.session.userId = user.id;
    }
    return user;
  }
}
