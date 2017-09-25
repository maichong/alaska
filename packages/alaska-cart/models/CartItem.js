// @flow

import { Model } from 'alaska';
import BALANCE from 'alaska-balance';
import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';

export default class CartItem extends Model {
  static label = 'Cart Item';
  static icon = 'shopping-cart';
  static defaultColumns = 'pic title user goods price sku createdAt';
  static defaultSort = '-sort';
  static noupdate = true;
  static nocreate = true;
  static defaultLimit = 100;

  static api = {
    list: 3,
    create: 3,
    remove: 3
  };

  static fields = {
    pic: {
      label: 'Picture',
      type: 'image'
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    goods: {
      label: 'Goods',
      ref: 'alaska-goods.Goods'
    },
    sku: {
      label: 'SKU',
      ref: 'alaska-goods.Sku'
    },
    skuDesc: {
      label: 'SKU Desc',
      type: String
    },
    user: {
      label: 'User',
      ref: 'alaska-user.User',
      index: true,
      private: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: BALANCE.currencies,
      default: BALANCE.defaultCurrency.value,
      group: 'price'
    },
    price: {
      label: 'Price',
      type: Number,
      default: 0,
      format: '0.00'
    },
    discount: {
      label: 'Discount',
      type: Number,
      default: 0,
      format: '0.00'
    },
    quantity: {
      label: 'Quantity',
      type: Number,
      default: 1
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  pic: Object;
  title: string;
  goods: Goods;
  sku: Sku;
  skuDesc: string;
  user: User;
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
