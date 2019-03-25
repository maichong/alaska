
import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';
import service from '..';

export default class User extends Model {
  static label = 'User';
  static icon = 'user';
  static titleField = 'displayName';
  static defaultColumns = 'avatar username email roles createdAt';
  static searchFields = 'username tel displayName email';
  static filterFields = 'roles createdAt?range @search';
  static defaultSort = '-createdAt';
  static noremove = true;

  static scopes = {
    tiny: 'displayName avatar _username',
    info: '*'
  };

  static relationships = {
    incomes: {
      optional: 'alaska-income',
      ref: 'alaska-income.Income',
      path: 'user'
    },
    commissions: {
      optional: 'alaska-commission',
      ref: 'alaska-commission.Commission',
      path: 'user'
    },
    withdraws: {
      optional: 'alaska-withdraw',
      ref: 'alaska-withdraw.Withdraw',
      path: 'user'
    },
    addresses: {
      optional: 'alaska-address',
      ref: 'alaska-address.Address',
      path: 'user'
    },
    orders: {
      optional: 'alaska-order',
      ref: 'alaska-order.Order',
      path: 'user'
    },
    carts: {
      optional: 'alaska-cart',
      ref: 'alaska-cart.CartGoods',
      path: 'user'
    },
    favorite: {
      optional: 'alaska-favorite',
      ref: 'alaska-favorite.Favorite',
      path: 'user'
    },
    events: {
      optional: 'alaska-event',
      ref: 'alaska-event.Event',
      path: 'user'
    },
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
  tel: string;
  displayName: string;
  password: string;
  avatar: Image;
  roles: any[];
  abilities: any[];
  createdAt: Date;

  __clearCache: boolean;

  // for alaska dev
  promoter: RecordId;
  promoterCommissionAmount: number;
  commissionAmount: number;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.displayName) {
      this.displayName = this.username;
    }
    this.__clearCache = this.isModified('abilities') || this.isModified('roles');
  }

  postSave() {
    if (this.__clearCache) {
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
