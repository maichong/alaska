// @flow

import alaska, { Service } from 'alaska';
import Ability from './models/Ability';
import Role from './models/Role';

/**
 * @class UserService
 */
class UserService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-user';
    super(options);
  }

  postInit() {
    let middlewares = alaska.getConfig('middlewares');
    let newConfigs = {
      middlewares: {
        user: {
          fn: require('./middlewares/user').default, // eslint-disable-line global-require
          sort: 700
        }
      }
    };
    if (!middlewares['alaska-middleware-session']) {
      // $Flow
      newConfigs.middlewares['alaska-middleware-session'] = {  // eslint-disable-line
        fn: require('alaska-middleware-session'), // eslint-disable-line
        sort: 800,
        options: alaska.main.getConfig('session')
      };
    }
    alaska.main.applyConfig(newConfigs);
  }

  /**
   * 获取所有权限列表
   * @returns {Ability[]}
   */
  async abilities(): Promise<Ability[]> {
    let { cache } = this;
    let data = await cache.get('abilities_list');
    if (data) {
      // $Flow
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
   * 获取角色列表
   * @returns {Role[]}
   */
  async roles(): Promise<Role[]> {
    let { cache } = this;
    let data = await cache.get('roles_list');
    if (data) {
      // $Flow
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
   * 清空本模块缓存
   */
  async clearCache(): Promise<void> {
    let { cache } = this;
    await cache.del('abilities_list');
    await cache.del('roles_list');
  }
}

export default new UserService();
