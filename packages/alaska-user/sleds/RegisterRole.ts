import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import service, { RegisterRoleParams } from '..';
import Role from '../models/Role';

/**
 * 注册角色
 */
export default class RegisterRole extends Sled<RegisterRoleParams, Role> {
  /**
   * @param {Object} params
   * @param {string} [params._id]
   * @param {string} [params.id]
   * @param {string} params.title
   * @param {number} params.sort
   * @param {string[]} params.abilities
   * @returns {Role}
   */
  async exec(params: RegisterRoleParams): Promise<Role> {
    this.service.debug('RegisterRole', params);
    let id: string = params.id;
    let roles: Role[] = await service.roles();
    let role = _.find(roles, (r) => r._id === id);
    if (role) {
      //角色已经存在
      return role;
    }
    role = new Role(params);
    role._id = id;
    await role.save({ session: this.dbSession });
    return role;
  }
}
