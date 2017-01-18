// @flow

import alaska from 'alaska';
import BALANCE from 'alaska-balance';
import Order from '../models/Order';
import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';

export default class OrderItem extends alaska.Model {
  static label = 'Order Item';
  static icon = 'list-ol';
  static defaultColumns = 'title order goods skuDesc price discount total quantity createdAt';
  static defaultSort = '-sort';
  static nocreate = true;
  static noedit = true;
  static noremove = true;

  static fields = {
    pic: {
      label: 'Main Picture',
      type: 'image',
      required: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    order: {
      label: 'Order',
      ref: 'Order',
      index: true
    },
    goods: {
      label: 'Goods',
      ref: 'alaska-goods.Goods',
      optional: true
    },
    sku: {
      label: 'SKU',
      ref: 'alaska-goods.Sku',
      optional: true
    },
    skuDesc: {
      label: 'SKU Desc',
      type: String
    },
    currency: {
      label: 'Currency',
      type: 'select',
      // $Flow
      options: BALANCE.currencies,
      default: BALANCE.defaultCurrency.value
    },
    price: {
      label: 'Price',
      type: Number
    },
    discount: {
      label: 'Discount',
      type: Number
    },
    quantity: {
      label: 'Quantity',
      type: Number
    },
    shipping: {
      label: 'Shipping',
      type: Number
    },
    total: {
      // total = (discount || price) * quantity
      label: 'Total Amount',
      type: Number
    },
    createdAt: {
      label: '添加时间',
      type: Date
    }
  };

  pic:Object;
  title:string;
  order:Order;
  goods:Goods;
  sku:Sku;
  skuDesc:string;
  currency:string;
  price:number;
  discount:number;
  quantity:number;
  shipping:number;
  total:number;
  createdAt:Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date;
    }
  }
}
