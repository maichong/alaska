import { Model } from 'alaska-model';

export default class Sku extends Model {
  static label = 'Sku';
  static icon = 'cubes';
  static defaultColumns = 'pic goods desc inventory price valid';
  static defaultSort = '-sort';
  static noupdate = true;
  static noremove = true;
  static nocreate = true;
  static titleField = 'desc';

  static fields = {
    pic: {
      label: 'Main Picture',
      type: 'image',
      required: true
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'Goods',
      index: true
    },
    key: {
      label: 'KEY',
      type: String
    },
    desc: {
      label: 'Description',
      type: String
    },
    price: {
      label: 'Price',
      type: Number,
      default: 0
    },
    discount: {
      label: 'Discount',
      type: Number,
      default: 0
    },
    inventory: {
      label: 'Inventory',
      type: Number,
      default: 0
    },
    volume: {
      label: 'Volume',
      type: Number,
      default: 0,
      private: true
    },
    valid: {
      label: 'Valid',
      type: Boolean,
      private: true
    },
    props: {
      label: 'Goods Properties',
      type: Object
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  _id: Object | string | number | any;
  pic: Object;
  goods: Object;
  key: string;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  valid: boolean;
  props: Object;
  createdAt: Date;
  __exist: boolean;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
