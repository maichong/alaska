
import { Model } from 'alaska-model';
import { ObjectId } from 'mongodb';
import Role from './Role';

export default class User extends Model {
  static label = 'User';
  static icon = 'user';
  static titleField = 'username';
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
    tel: {
      label: 'Tel',
      type: String,
      index: true
    },
    displayName: {
      label: 'Display Name',
      type: String
    },
    password: {
      label: 'Password',
      type: 'password',
      private: true, // 前端API接口不返回
      protected: true // admin后台接口不返回
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
      private: true
    },
    abilities: {
      label: 'Abilities',
      type: 'relationship',
      ref: 'Ability',
      multi: true,
      private: true
    },
    createdAt: {
      label: 'Registered At',
      type: Date
    }
  };

  _id: ObjectId;
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: Object;
  roles: any[];
  abilities: any[];
  createdAt: Date;
  displayName: string;

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.displayName) {
      this.displayName = this.username;
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
