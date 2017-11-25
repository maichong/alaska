// @flow

import { Model } from 'alaska';
import Brand from 'alaska-goods/models/Brand';

export default class Shop extends Model {
  static label = 'Shop';
  static icon = 'home';
  static defaultColumns = 'logo title user brand activated createdAt';
  static defaultSort = '-createdAt';

  static defaultFilters = (ctx: Alaska$Context) => {
    if (ctx.service.id === 'alaska-admin') return null;
    return {
      activated: true
    };
  };

  static api = {
    paginate: 1,
    show: 1
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    logo: {
      label: 'Logo',
      type: 'image'
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      required: true
    },
    brand: {
      label: 'Brand',
      ref: 'alaska-goods.Brand',
      optional: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      private: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    desc: {
      label: 'Description',
      type: 'html'
    }
  };

  title: string;
  logo: Object;
  user: User;
  brand: Brand;
  activated: boolean;
  createdAt: Date;
  desc: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
