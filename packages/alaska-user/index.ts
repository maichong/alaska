
import * as _ from 'lodash';
import { Service, ServiceOptions } from 'alaska';
import { Model, Filters } from 'alaska-model';
import { Sled } from 'alaska-sled';
import Ability from './models/Ability';
import Role from './models/Role';
import User from './models/User';
import { URRC } from 'alaska-user';
import UserURRC from './urrc/user';

/**
 * @class UserService
 */
class UserService extends Service {
  urrc: Map<string, URRC>;

  constructor(options: ServiceOptions) {
    super(options);
    this.urrc = new Map();
    this.urrc.set('user', UserURRC({ field: 'user' }));
  }

  /**
   * 获取所有权限列表
   * TODO: cache
   * @returns {Ability[]}
   */
  async abilities(): Promise<Ability[]> {
    // let { cache } = this;
    // let data = await cache.get('abilities_list');
    // if (data) {
    //   return Ability.fromObjectArray(data);
    // }
    let records: Ability[] = await Ability.find().sort('-sort');
    // if (records.length) {
    //   //缓存10分钟
    //   await cache.set('abilities_list', Ability.toObjectArray(records), 600 * 1000);
    // }
    return records;
  }

  /**
   * 获取角色列表
   * TODO: cache
   * @returns {Role[]}
   */
  async roles(): Promise<Role[]> {
    // let { cache } = this;
    // let data = await cache.get('roles_list');
    // if (data) {
    //   return Role.fromObjectArray(data);
    // }
    let roles: Role[] = await Role.find().sort('-sort');
    // if (roles.length) {
    //   //缓存10分钟
    //   await cache.set('abilities_list', Role.toObjectArray(roles), 600 * 1000);
    // }
    return roles;
  }

  /**
   * 获取用户的所有权限列表
   * @param {User|null} user 如果为null，则代表未登录
   */
  async getUserAbilities(user: User | null): Promise<string[]> {
    let roles: Set<string> = new Set();
    let abilities: Set<string> = new Set();
    if (!user || !user.id) {
      // guest
      roles.add('guest');
    } else {
      roles.add('user');
      _.forEach(user.roles, (r) => roles.add(r));
      _.forEach(user.abilities, (a) => abilities.add(a));
    }
    let rolesMap = _.keyBy(await this.roles(), 'id');
    for (let role of roles) {
      let r = rolesMap[role];
      if (r) {
        _.forEach(r.abilities, (a) => abilities.add(a));
      }
    }
    return Array.from(abilities);
  }

  /**
   * 检查用户权限
   * @param {User|null} user 如果为null，则代表未登录
   * @param {string} ability
   * @param {Model} [record] 要检查的数据记录
   */
  async hasAbility(user: User | null, ability: string, record?: Model): Promise<boolean> {
    let abilities = await this.getUserAbilities(user);
    let relationships = [];
    for (let a of abilities) {
      if (ability === a) return true;
      let [prefix, relationship] = a.split(':');
      if (prefix === ability && relationship) {
        if (!record) return true; // 不检查数据关系
        relationships.push(relationship);
      }
    }
    for (let r of relationships) {
      let checker = this.urrc.get(r);
      if (!checker) continue;
      if (await checker.check(user || {}, record)) return true;
    }
    return false;
  }

  /**
   * 创建查询过滤器
   * @param {User|null} user 如果为null，则代表未登录
   * @param {string} ability
   */
  async createFilters(user: User, ability: string): Promise<Filters | null> {
    let abilities = await this.getUserAbilities(user);
    let relationships = [];
    let filters = [];
    for (let a of abilities) {
      if (ability === a) return {}; // 不需要过滤器
      let [prefix, relationship] = a.split(':');
      if (prefix === ability && relationship) {
        relationships.push(relationship);
      }
    }
    for (let r of relationships) {
      let checker = this.urrc.get(r);
      if (!checker) continue;
      let filter = await checker.filter(user);
      if (!_.find(filters, (f) => _.isEqual(f, filter))) {
        filters.push(filter);
      }
    }
    if (filters.length === 0) return null; // 无权
    if (filters.length === 1) return filters[0];
    return {
      $or: filters
    };
  }

  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName: string, data?: Object): Promise<any> {
    if (!this.sleds || !this.sleds[sledName]) {
      throw new Error(`"${sledName}" sled not found`);
    }
    try {
      let SledClass: typeof Sled = this.sleds[sledName];
      let sled = new SledClass(data);
      return sled.run();
    } catch (error) {
      return Promise.reject(error);
    }
  }

}

export default new UserService({
  id: 'alaska-user'
});
