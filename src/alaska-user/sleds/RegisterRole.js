// @flow

import _ from 'lodash';
import { Sled } from 'alaska';
import service from '../';
import Role from '../models/Role';

/**
 * 注册角色
 */
export default class RegisterRole extends Sled {
  /**
   * @param {Object} params
   * @param {string} [params._id]
   * @param {string} [params.id]
   * @param {string} params.title
   * @param {number} params.sort
   * @param {string[]} params.abilities
   * @returns {Role}
   */
  async exec(params: {
    _id?:string;
    id:string;
    title:string;
    sort:number;
    abilities:string[]
  }): Promise<Role> {
    let id: string = params._id || params.id;
    let roles: Role[] = await service.roles();
    let role = _.find(roles, (r) => r._id === id);
    if (role) {
      //角色已经存在
      return role;
    }
    console.log(`Register role : ${id}`);
    role = new Role(params);
    role._id = id;
    await role.save();
    return role;
  }
}
