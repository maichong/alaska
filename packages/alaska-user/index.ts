
import * as _ from 'lodash';
import * as checkDepends from 'check-depends';
import { Service, ServiceOptions } from 'alaska';
import { Model, Filters, AbilityCheckGate } from 'alaska-model';
import CacheDriver from 'alaska-cache';
import Ability from './models/Ability';
import Role from './models/Role';
import User from './models/User';
import { URRC } from 'alaska-user';
import UserURRC from './urrc/user';
import SelfURRC from './urrc/self';

/**
 * @class UserService
 */
class UserService extends Service {
  urrc: Map<string, URRC>;
  cache?: CacheDriver<string[], any, any>;

  constructor(options: ServiceOptions) {
    super(options);
    this.urrc = new Map();
    this.urrc.set('user', UserURRC({ field: 'user' }));
    this.urrc.set('self', SelfURRC());
  }

  postStart() {
    let cacheConfig = this.config.get('cache');
    if (cacheConfig && cacheConfig.type) {
      this.cache = this.createDriver(cacheConfig) as CacheDriver<string[], any, any>;
    }
  }

  /**
   * 获取所有权限列表
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
    let result: string[];
    let cacheKey = 'cache:user-abilities:' + (user ? user.id : '_guest')
    if (this.cache) {
      result = await this.cache.get(cacheKey);
      if (result) return result;
    }
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
    result = Array.from(abilities);
    if (this.cache) {
      this.cache.set(cacheKey, result);
    }
    return result;
  }

  /**
   * 判断权限
   * @param {User|null} user 如果为null，则代表未登录
   * @param {any} conditions checkDepends条件 或高级的权限查询或非门条件
   * @param {Model} [record] 要检查的数据记录
   */
  async checkAbility(
    user: User | null,
    conditions: checkDepends.DependsQueryExpression | AbilityCheckGate[],
    record?: Model
  ): Promise<boolean> {
    if (!conditions) return false;
    if (!Array.isArray(conditions)) return checkDepends(conditions, record);
    if (!conditions.length) return true;
    // 寻找开着的门
    for (let gate of conditions) {
      if (gate.check) {
        if (!checkDepends(gate.check, record)) continue; // 此门不开
      }
      if (gate.ability) {
        if (!await this.hasAbility(user, gate.ability, record)) continue; // 此门不开
      }
      return true; // 此门开着，放水
    }
    return false;
  }

  /**
   * 检查用户权限
   * @param {User|null} user 如果为null，则代表未登录
   * @param {string} ability
   * @param {Model} [record] 要检查的数据记录
   */
  async hasAbility(user: User | null, ability: string, record?: Model): Promise<boolean> {
    let abilities = await this.getUserAbilities(user);
    let [prefix, checker] = ability.split(':');

    if (!record) {
      // 不检查数据记录，只检查数据类型
      if (abilities.includes(ability)) return true;
      if (checker) return false;
      for (let str of abilities) {
        str = str.split(':')[0];
        if (str === ability) return true;
      }
      return false;
    }

    // 需要检查数据记录
    if (checker && !this.urrc.has(checker)) {
      // checker 函数不存在
      return false;
    }

    for (let str of abilities) {
      let [p, c] = str.split(':');
      if (prefix !== p) continue;
      if (checker && c !== checker) continue;
      if (!c) return true; // 拥有全类管理权限
      if (!this.urrc.has(c)) continue;
      if (await this.urrc.get(c).check(user, record)) return true;
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
}

export default new UserService({
  id: 'alaska-user'
});
