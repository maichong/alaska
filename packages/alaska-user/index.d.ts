import { Service } from 'alaska';
import { Model, Filters, AbilityCheckGate } from 'alaska-model';
import { DependsQueryExpression } from 'check-depends';
import { Context } from 'alaska-http';
import Ability from './models/Ability';
import Role from './models/Role';
import User from './models/User';

declare module 'alaska' {
  interface ConfigData {
    autoLogin?: AutoLoginConfig;
  }
}

declare interface AutoLoginConfig {
  key: string;
  secret: string;
}

// Sleds

export interface LoginParams {
  ctx: Context;
  user?: User;
  username: string;
  password: string;
  remember?: boolean;
}

export interface LogoutParams {
  ctx: Context;
}

export interface RegisterParams {
  ctx?: Context;
  user?: User;
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterAbilityParams {
  id: string;
  title: string;
  service: string;
}

export interface RegisterRoleParams {
  id: string;
  title: string;
  sort?: number;
  abilities: string[];
}

/**
 * User resource relationship checker
 */
export interface URRC {
  /**
   * @param {any} user 一定存在，{}空对象代表访客
   * @param {Model} record 要检查的数据记录
   * @returns {boolean | Promise<boolean>}
   */
  check(user: any, record: any): boolean | Promise<boolean>;
  /**
   * 创建查询过滤器
   * @param {any} user 一定存在，{}空对象代表访客
   * @returns {null | Filters | Promise<null | Filters>}
   */
  filter(user: any): Filters | Promise<Filters>;
}

export interface URRCGenerator {
  (options?: any): URRC;
}

// Service
export class UserService extends Service {
  models: {
    User: typeof User;
    Ability: typeof Ability;
    Role: typeof Role;
  };

  /**
   * User resource relationship checker
   */
  urrc: Map<string, URRC>;

  abilities(): Promise<Ability[]>;
  roles(): Promise<Role[]>;

  /**
   * 获取用户的所有权限列表
   * @param {User|null} user 如果为null，则代表未登录
   */
  getUserAbilities(user: User | null): Promise<string[]>;

  /**
   * 判断权限
   * @param {User|null} user 如果为null，则代表未登录
   * @param {any} conditions checkDepends条件 或高级的权限查询或非门条件
   * @param {Model} [record] 要检查的数据记录
   */
  checkAbility(
    user: User | null,
    conditions: DependsQueryExpression | AbilityCheckGate[],
    record?: Model
  ): Promise<boolean>;

  /**
   * 检查用户权限
   * @param {User|null} user 如果为null，则代表未登录
   * @param {string} ability 权限
   * @param {Model} [record] 要检查的数据记录
   */
  hasAbility(user: User | null, ability: string, record?: Model): Promise<boolean>;
  /**
   * 创建查询过滤器
   * @param {User|null} user 如果为null，则代表未登录
   * @param {string} ability 权限
   */
  createFilters(user: User, ability: string): Promise<Filters | null>;
}

declare const userService: UserService;

export default userService;
