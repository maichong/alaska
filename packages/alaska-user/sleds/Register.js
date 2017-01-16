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
   * @param {Object}  data
   * @param {Context} [data.ctx]
   * @param {User}    [data.user]
   * @param {string}  [data.username]
   * @param {string}  [data.password]
   *                 ...
   * @returns {User}
   */
  async exec(data: {
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
    let user = data.user;
    if (!user) {
      let count = await User.count({
        username: new RegExp('^' + utils.escapeRegExp(data.username) + '$', 'i')
      });
      if (count) {
        service.error('Username is exists');
      }
      if (data.email) {
        let emailCount = await User.count({
          email: new RegExp('^' + utils.escapeRegExp(data.email) + '$', 'i')
        });
        if (emailCount) {
          service.error('Email is exists');
        }
      }
      user = new User(_.omit(data, 'ctx', 'user'));
    }
    await user.save();

    if (data.ctx) {
      data.ctx.session.userId = user.id;
    }
    return user;
  }
}
