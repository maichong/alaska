// @flow

import { utils, Sled } from 'alaska';
import _ from 'lodash';
import service from '../';
import User from '../models/User';
import SETTINGS from 'alaska-settings';

/**
 * 用户注册
 */
export default class Register extends Sled {
  /**
   * @param {Object}  params
   * @param {Context} [params.ctx]
   * @param {User}    [params.user]
   * @param {string}  [params.username]
   * @param {string}  [params.password]
   *                 ...
   * @returns {User}
   */
  async exec(params: {
    ctx?:Alaska$Context;
    user?:User;
    username?:string;
    password?:string;
  }): Promise<User> {
    let closeRegister = await SETTINGS.get('user.closeRegister');
    if (closeRegister) {
      let closeRegisterReason = await SETTINGS.get('user.closeRegisterReason');
      service.error(closeRegisterReason || 'Register closed');
    }
    let user = params.user;
    if (!user) {
      let count = await User.count({
        username: new RegExp('^' + utils.escapeRegExp(params.username) + '$', 'i')
      });
      if (count) {
        service.error('Username is exists');
      }
      if (params.email) {
        let emailCount = await User.count({
          email: new RegExp('^' + utils.escapeRegExp(params.email) + '$', 'i')
        });
        if (emailCount) {
          service.error('Email is exists');
        }
      }
      user = new User(_.omit(params, 'ctx', 'user'));
    }
    await user.save();

    if (params.ctx) {
      params.ctx.session.userId = user.id;
    }
    return user;
  }
}
