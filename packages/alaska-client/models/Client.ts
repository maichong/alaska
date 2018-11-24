import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';
import * as random from 'string-random';
import service from '..';

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
    uuid: {
      label: 'Device UUID',
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
    }
  };

  _id: string | number | Object | any;
  uuid: string;
  platform: string;
  token: string;
  user: string;

  preSave() {
    if (!this.token) {
      this.token = random(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789');
    }
  }
}
