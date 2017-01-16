import _ from 'lodash';
import alaska from 'alaska';
import Role from '../models/Role';

/**
 * 注册角色
 */
export default class RegisterRole extends alaska.Sled {
  /**
   * @param data
   *        data.id
   *        data.title
   *        data.sort
   *        data.abilities 角色默认权限id列表
   * @returns {Role}
   */
  async exec(data) {
    let id = data._id || data.id;
    let roles = await this.service.roles();
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
