import { Model, RecordId } from 'alaska-model';
import { Context } from 'alaska-http';
import { Image } from 'alaska-field-image';

function defaultFilters(ctx: Context) {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
}

export default class Shop extends Model {
  static label = 'Shop';
  static icon = 'home';
  static defaultColumns = 'logo title user tel brand activated createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';

  static defaultFilters = defaultFilters;

  static api = {
    paginate: 1,
    list: 1,
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
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true
    },
    brand: {
      label: 'Brand',
      type: 'relationship',
      ref: 'alaska-brand.Brand',
      optional: 'alaska-brand'
    },
    tel: {
      label: 'Tel',
      type: String
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      protected: true
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
  tel: string;
  logo: Image;
  user: RecordId;
  brand: RecordId;
  activated: boolean;
  createdAt: Date;
  desc: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
