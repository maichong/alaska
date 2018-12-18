import { RecordID, Model } from 'alaska-model';
import { PropData } from 'alaska-property';
import { Image } from 'alaska-field-image';

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
      ref: 'alaska-goods.Goods',
      index: true
    },
    key: {
      // pid1:vid1;pid2:vid2
      label: 'KEY',
      type: String,
      index: true
    },
    desc: {
      // 颜色:白色;尺码:XL
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

  key: string;
  pic: Image;
  goods: RecordID;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  valid: boolean;
  props: PropData[];
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
