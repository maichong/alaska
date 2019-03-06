import { RecordId, Model } from 'alaska-model';
import balanceService from 'alaska-balance';

export default class CartGoods extends Model {
  static label = 'Cart Goods';
  static icon = 'shopping-cart';
  static defaultColumns = 'pic title user goods price sku createdAt';
  static defaultSort = '-sort';
  static defaultLimit = 100;
  static nocreate = true;

  static populations = {
    // goods: {
    //   auto: true,
    //   autoSelect: true,
    //   select: 'id title inventory price discount discountStartAt discountEndAt skus',
    //   populations: {
    //     cat: {
    //       auto: true
    //     }
    //   }
    // }
  };

  static api = {
    count: 2,
    list: 2,
    create: 2,
    remove: 2,
    update: 2
  };

  static fields = {
    pic: {
      label: 'Picture',
      disabled: true,
      type: 'image'
    },
    title: {
      label: 'Title',
      type: String,
      disabled: true,
      required: true
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      disabled: true
    },
    sku: {
      label: 'SKU',
      type: 'relationship',
      ref: 'alaska-sku.Sku',
      optional: 'alaska-sku.Sku',
      disabled: true
    },
    skuDesc: {
      label: 'SKU Desc',
      disabled: true,
      type: String
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      disabled: true,
      index: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value),
      disabled: true,
      group: 'price'
    },
    price: {
      label: 'Price',
      type: Number,
      default: 0,
      disabled: true,
      format: '0.00'
    },
    discount: {
      label: 'Discount',
      type: Number,
      default: 0,
      disabled: true,
      format: '0.00'
    },
    quantity: {
      label: 'Quantity',
      type: Number,
      default: 1
    },
    createdAt: {
      label: 'Created At',
      disabled: true,
      type: Date
    }
  };

  pic: Object;
  title: string;
  goods: RecordId;
  sku: RecordId;
  skuDesc: string;
  user: RecordId;
  currency: string;
  price: number;
  discount: number;
  quantity: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
