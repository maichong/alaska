// @flow

import alaska, { Service } from 'alaska';
import path from 'path';
import Ability from './models/Ability';
import Role from './models/Role';

/**
 * @class UserService
 */
class UserService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-user';
    super(options);
  }

  postInit() {
    alaska.main.applyConfig({
      '+appMiddlewares': [{
        id: 'alaska-middleware-session',
        sort: 800,
        options: alaska.main.config('session')
      }, {
        id: path.join(__dirname, '/middlewares/user.js'),
        sort: 700
      }]
    });
  }

  /**
   * [async] 获取所有权限列表
   * @returns {Ability[]}
   */
  async abilities() {
    let cache = this.cache;
    let data = await cache.get('abilities_list');
    if (data) {
      return Ability.fromObjectArray(data);
    }
    // $Flow
    let records: Ability[] = await Ability.find().sort('-sort');
    if (records.length) {
      //缓存10分钟
      await cache.set('abilities_list', Ability.toObjectArray(records), 600 * 1000);
    }
    return records;
  }

  /**
   * [async] 获取角色列表
   * @returns {Role[]}
   */
  async roles() {
    let cache = this.cache;
    let data = await cache.get('roles_list');
    if (data) {
      return Role.fromObjectArray(data);
    }
    // $Flow
    let roles: Role[] = await Role.find().sort('-sort');
    if (roles.length) {
      //缓存10分钟
      await cache.set('abilities_list', Role.toObjectArray(roles), 600 * 1000);
    }
    return roles;
  }

  /**
   * [async] 清空本模块缓存
   */
  async clearCache() {
    let cache = this.cache;
    await cache.del('abilities_list');
    await cache.del('roles_list');
  }

}

export default new UserService();
