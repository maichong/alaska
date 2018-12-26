import { RecordId, Model } from 'alaska-model';
import balanceService from 'alaska-balance';
import Goods from 'alaska-goods/models/Goods';
import Order from '../models/Order';

export default class OrderGoods extends Model {
  static label = 'Order Item';
  static icon = 'list-ol';
  static defaultColumns = 'title order goods skuDesc price discount total quantity createdAt';
  static defaultSort = '-sort';
  static nocreate = true;
  static noupdate = true;
  static noremove = true;

  static api = {
    list: 2
  };

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
      type: 'relationship',
      ref: 'Order',
      index: true
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: true
    },
    sku: {
      label: 'SKU',
      type: 'relationship',
      ref: 'alaska-goods.Sku',
      optional: true
    },
    skuKey: {
      label: 'SKU Key',
      type: String,
      hidden: true
    },
    skuDesc: {
      label: 'SKU Desc',
      type: String
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value)
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
    refundedAmount: {
      label: 'Refunded Amount',
      type: Number,
      hidden: '!refundedAmount'
    },
    refundedQuantity: {
      label: 'Refunded Quantity',
      type: Number,
      hidden: '!refundedQuantity'
    },
    refundReason: {
      label: 'Refund Reason',
      type: String,
      hidden: '!refundReason'
    },
    refundAmount: {
      label: 'Refund Amount',
      type: Number,
      hidden: '!refundAmount'
    },
    refundQuantity: {
      label: 'Refund Quantity',
      type: Number,
      hidden: '!refundQuantity'
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  pic: Object;
  title: string;
  order: RecordId;
  goods: RecordId;
  sku?: RecordId;
  skuKey: string;
  skuDesc: string;
  currency: string;
  price: number;
  discount: number;
  quantity: number;
  shipping: number;
  total: number;
  /**
   * 订单已退款金额，总额
   */
  refundedAmount: number;
  /**
   * 客户已经退货的商品总数量
   */
  refundedQuantity: number;
  refundReason: string;
  refundAmount: number;
  refundQuantity: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
