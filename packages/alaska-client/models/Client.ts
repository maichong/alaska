import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';
import * as random from 'string-random';

export default class Client extends Model {
  static label = 'Client';
  static icon = 'lock';
  static titleField = 'token';
  static defaultColumns = '_id user token uuid platform';
  static defaultSort = '_id';

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: User,
      index: true,
      private: true
    },
    deviceId: {
      label: 'Device ID',
      type: String,
      default: '',
      private: true
    },
    platform: {
      label: 'Platform',
      type: String,
      default: '',
      private: true
    },
    token: {
      label: 'Token',
      type: String
    },
    expiredAt: {
      label: 'Expired At',
      type: Date,
      private: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  _id: string | number | Object | any;
  deviceId: string;
  platform: string;
  token: string;
  user: string;
  expiredAt: Date | null;
  createdAt: Date;

  preSave() {
    if (!this.token) {
      this.token = random(32);
    }
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
