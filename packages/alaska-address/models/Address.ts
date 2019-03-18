import { Model } from 'alaska-model';

export default class Address extends Model {
  static label = 'Address';
  static icon = 'map-marker';
  static titleField = 'name';
  static defaultColumns = 'user name tel province city district street detail isDefault';
  static filterFields = 'user createdAt?range @search';
  static defaultSort = '-createdAt';

  static api = {
    create: 2,
    show: 2,
    list: 2,
    paginate: 2,
    remove: 2,
    update: 2
  };

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true
    },
    name: {
      label: 'Name',
      type: String,
      default: ''
    },
    tel: {
      label: 'Tel',
      type: String
    },
    zip: {
      label: 'ZIP Code',
      type: String
    },
    geo: {
      label: 'GEO',
      type: 'geo'
    },
    country: {
      label: 'Country',
      type: String
    },
    province: {
      label: 'Province',
      type: String
    },
    city: {
      label: 'City',
      type: String
    },
    district: {
      label: 'District',
      type: String
    },
    street: {
      label: 'Street',
      type: String
    },
    building: {
      label: 'Building',
      type: String
    },
    detail: {
      label: 'Detail',
      type: String
    },
    isDefault: {
      label: 'Default',
      type: Boolean
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  user: string;
  name: string;
  tel: string;
  zip: string;
  geo: [number, number];
  country: string;
  province: string;
  city: string;
  district: string;
  street: string;
  building: string;
  detail: string;
  isDefault: boolean;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  async postSave() {
    // 只能存在一个默认地址
    if (this.isDefault) {
      await Address.updateMany(
        { user: this.user, isDefault: true, _id: { $ne: this._id } },
        { isDefault: false }
      );
    }
  }
}
