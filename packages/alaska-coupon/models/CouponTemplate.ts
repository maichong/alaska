import * as random from 'string-random';
import { Model, RecordId } from 'alaska-model';

export default class CouponTemplate extends Model {
  static label = 'Coupon Template';
  static icon = 'credit-card-alt';
  static defaultColumns = 'code title type rate amount starting shops cats goods activated createdAt expiredAt';
  static defaultSort = '-createdAt';
  static filterFields = 'type?switch&nolabel shops rate@range amount@range @search';
  static searchFields = 'code title';
  static relationships = {
    coupons: {
      ref: 'alaska-coupon.Coupon',
      path: 'template'
    },
    orders: {
      ref: 'alaska-order.Order',
      path: 'couponTemplate'
    }
  };

  static fields = {
    code: {
      label: 'Coupon Code',
      type: String,
      index: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    activated: {
      label: 'Template Activated',
      type: Boolean
    },
    type: {
      label: 'Type',
      type: 'select',
      switch: true,
      options: [{
        label: 'Rate Discount',
        value: 'rate'
      }, {
        label: 'Amount Discount',
        value: 'amount'
      }]
    },
    rate: {
      label: 'Discount Rate',
      type: Number,
      format: '0.00',
      default: 1,
      min: 0,
      max: 1,
      hidden: {
        type: { $ne: 'rate' }
      }
    },
    amount: {
      label: 'Discount Amount',
      type: 'money',
      hidden: {
        type: { $ne: 'amount' }
      }
    },
    starting: {
      label: 'Starting Price',
      type: 'money'
    },
    shop: {
      label: 'Shop Specified',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop',
      help: 'None for all shops'
    },
    cats: {
      label: 'Categories Specified',
      type: 'relationship',
      ref: 'alaska-category.Category',
      optional: 'alaska-category',
      multi: true,
      help: 'None for all categories'
    },
    goods: {
      label: 'Goods Specified',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods',
      multi: true,
      help: 'None for all goods'
    },
    couponPeriod: {
      label: 'Coupon Period',
      type: Number,
      addonAfter: 'days'
    },
    couponExpiredAt: {
      label: 'Coupon Expired At',
      type: Date
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    expiredAt: {
      label: 'Template Expired At',
      type: Date,
      protected: true
    }
  };

  code: string;
  title: string;
  activated: boolean;
  type: 'rate' | 'amount';
  rate: number;
  amount: number;
  starting: number;
  shop: RecordId;
  cats: RecordId[];
  goods: RecordId[];
  couponPeriod: number;
  couponExpiredAt: Date;
  createdAt: Date;
  expiredAt: Date;

  preSave() {
    if (!this.code) {
      this.code = random(8).toUpperCase();
    }
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
