// @flow

import { Model } from 'alaska';
import Role from './Role';

export default class User extends Model {

  static label = 'User';
  static icon = 'user';
  static title = 'username';
  static defaultColumns = 'avatar username email roles createdAt';
  static searchFields = 'username email';
  static defaultSort = '-createdAt';
  static noremove = true;

  static scopes = {
    tiny: 'displayName avatar _username',
    info: '*'
  };

  static fields = {
    username: {
      label: 'Username',
      type: String,
      unique: true,
      required: true
    },
    email: {
      label: 'Email',
      type: String,
      index: true
    },
    password: {
      label: 'Password',
      type: 'password',
      default: 1,
      private: true
    },
    avatar: {
      label: 'Avatar',
      type: 'image'
    },
    roles: {
      label: 'Roles',
      ref: 'Role',
      multi: true,
      private: true
    },
    abilities: {
      label: 'Abilities',
      ref: 'Ability',
      multi: true,
      private: true
    },
    createdAt: {
      label: 'Registered At',
      type: Date
    }
  };

  static virtuals = {
    get displayName() {
      return this.username;
    }
  };

  username: string;
  email: string;
  password: string;
  avatar: Object;
  roles: Object[];
  abilities: Object[];
  createdAt: Date;
  displayName: string;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  /**
   * 验证密码
   * @param candidate 待检测密码
   * @returns {Promise<boolean>}
   */
  auth(candidate: string): Promise<boolean> {
    return this._.password.compare(candidate);
  }

  /**
   * [async] 判断用户是否有指定权限
   * @param id
   * @returns {boolean}
   */
  async hasAbility(id: string): Promise<boolean> {
    //查找用户特殊权限
    if (this.abilities) {
      for (let aid of this.abilities) {
        //如果abilities属性中储存的是Ability对象
        if (aid._id && aid._id === id) {
          return true;
        }
        if (aid === id) {
          return true;
        }
      }
    }

    //查找用户组权限
    if (this.roles) {
      for (let rid of this.roles) {
        if (!rid.hasAbility) {
          rid = await Role.findById(rid);
        }
        if (rid) {
          // $Flow
          let role: Role = rid;
          if (await role.hasAbility(id)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
