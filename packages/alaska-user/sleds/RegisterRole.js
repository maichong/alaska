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
   * @param {Object} data
   * @param {string} [data._id]
   * @param {string} [data.id]
   * @param {string} data.title
   * @param {number} data.sort
   * @param {string[]} data.abilities
   * @returns {Role}
   */
  async exec(data: {
    _id?:string;
    id:string;
    title:string;
    sort:number;
    abilities:string[]
  }): Promise<Role> {
    let id: string = data._id || data.id;
    let roles: Role[] = await service.roles();
    let role = _.find(roles, (r) => r._id === id);
    if (role) {
      //角色已经存在
      return role;
    }
    console.log(`Register role : ${id}`);
    role = new Role(data);
    role._id = id;
    await role.save();
    return role;
  }
}
