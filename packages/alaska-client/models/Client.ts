import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';
import * as random from 'string-random';

export default class Client extends Model {
  static label = 'Client';
  static icon = 'mobile';
  static titleField = 'token';
  static defaultColumns = '_id user platform deviceId token createdAt expiredAt';
  static defaultSort = '_id';

  static api = {
    create: 1
  };

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: User,
      index: true,
      protected: true
    },
    deviceId: {
      label: 'Device ID',
      type: String,
      default: '',
      index: true,
      protected: true
    },
    platform: {
      label: 'Platform',
      type: String,
      default: '',
      protected: true
    },
    token: {
      label: 'Token',
      type: String,
      unique: true
    },
    expiredAt: {
      label: 'Expired At',
      type: Date,
      protected: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

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
