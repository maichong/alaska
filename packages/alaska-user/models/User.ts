
import { Model } from 'alaska-model';
import service from '..';

export default class User extends Model {
  static label = 'User';
  static icon = 'user';
  static titleField = 'displayName';
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
      required: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    },
    email: {
      label: 'Email',
      type: String,
      index: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    },
    tel: {
      label: 'Tel',
      type: String,
      index: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    },
    displayName: {
      label: 'Display Name',
      type: String
    },
    password: {
      label: 'Password',
      type: 'password',
      private: true, // 前端API接口不返回,admin后台接口不返回
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    },
    avatar: {
      label: 'Avatar',
      type: 'image'
    },
    roles: {
      label: 'Roles',
      type: 'relationship',
      ref: 'Role',
      multi: true,
      protected: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }],
      checkbox: true
    },
    abilities: {
      label: 'Abilities',
      type: 'relationship',
      ref: 'Ability',
      multi: true,
      protected: true,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    },
    createdAt: {
      label: 'Registered At',
      type: Date,
      disabled: [{
        ability: 'alaska-user.User.update'
      }]
    }
  };

  id: string;
  username: string;
  email: string;
  password: string;
  avatar: Object;
  roles: any[];
  abilities: any[];
  createdAt: Date;
  displayName: string;

  _clearCache: boolean;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.displayName) {
      this.displayName = this.username;
    }
    this._clearCache = this.isModified('abilities') || this.isModified('roles');
  }

  postSave() {
    if (this._clearCache) {
      service.clearUserAbilitiesCache(this.id);
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
}
