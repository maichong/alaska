import * as _ from 'lodash';
import * as mongodb from 'mongodb';
import { NormalError } from 'alaska';
import { Model, RecordId } from 'alaska-model';
import { isIdEqual } from 'alaska-model/utils';
import OrderLog from './OrderLog';
import OrderGoods from './OrderGoods';
import { Context } from 'alaska-http';
import { Image } from 'alaska-field-image';
import { Address } from 'alaska-address/types';
import service from '..';

function defaultFilters(ctx: Context) {
  let field = ctx.service.id === 'alaska-admin' ? 'adminDeleted' : 'userDeleted';
  return {
    [field]: {
      $ne: true
    }
  };
}

export default class Order extends Model {
  static label = 'Order';
  static icon = 'file-text-o';
  static defaultColumns = 'pic code title user shop total payed refundedAmount state createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';
  static nocreate = true;
  static noremove = true;
  static filterFields = 'type?switch&nolabel state?switch&nolabel shop user total?range @search';

  static defaultFilters = defaultFilters;

  static relationships = {
    orderGoods: {
      ref: 'OrderGoods',
      path: 'order'
    },
    logs: {
      ref: 'OrderLog',
      path: 'order',
      protected: true
    }
  };

  static populations = {
    goods: {
      auto: true,
      path: 'goods'
    },
    shop: {
      auto: true,
      path: 'shop'
    }
  };

  static scopes = {
    // list: '*'
  };

  static api = {
    list: 2,
    paginate: 2,
    count: 2,
    show: 2,
    create: 2
  };

  static actions = {
    confirm: {
      title: 'Confirm Order',
      icon: 'check',
      color: 'success',
      sled: 'Confirm',
      hidden: {
        state: {
          $ne: 300
        }
      }
    },
    reject: {
      title: 'Reject Order',
      icon: 'ban',
      color: 'danger',
      sled: 'Reject',
      confirm: 'Confirm to reject the order?',
      hidden: {
        state: {
          $ne: 300
        }
      }
    },
    ship: {
      title: 'Ship',
      icon: 'truck',
      color: 'success',
      sled: 'Ship',
      hidden: {
        state: {
          $ne: 400
        }
      }
    },
    acceptRefund: {
      title: 'Accept Refund',
      icon: 'check',
      color: 'warning',
      confirm: 'Confirm to accept refund?',
      sled: 'AcceptRefund',
      hidden: {
        state: {
          $ne: 800
        }
      }
    },
    rejectRefund: {
      title: 'Reject Refund',
      icon: 'times',
      color: 'danger',
      confirm: 'Confirm to reject refund?',
      sled: 'RejectRefund',
      hidden: {
        state: {
          $ne: 800
        }
      }
    },
    delete: {
      title: 'Delete',
      icon: 'trash-o',
      color: 'danger',
      confirm: 'Confirm to delete the order?',
      sled: 'Delete',
      post: 'js:history.back()'
    }
  };

  static fields = {
    code: {
      label: 'Order Code',
      type: String,
      unique: true,
      disabled: true
    },
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
      index: true
    },
    store: {
      label: 'Store',
      type: 'select:store',
      disabled: '!isNew',
      switch: true,
      default: 'default',
      options: [{
        label: 'Default',
        value: 'default'
      }]
    },
    shop: {
      label: 'Shop',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop',
      index: true
    },
    type: {
      label: 'Type',
      type: 'select',
      default: 'goods',
      options: [{
        label: 'Goods',
        value: 'goods'
      }]
    },
    pic: {
      label: 'Picture',
      type: 'image'
    },
    goods: {
      label: 'Order Goods',
      type: 'relationship',
      ref: 'OrderGoods',
      hidden: true,
      multi: true,
      disabled: true
    },
    delivery: {
      label: 'Delivery',
      type: 'select',
      switch: true,
      default: 'express',
      options: [{
        label: 'None',
        value: 'none'
      }, {
        label: 'Express',
        value: 'express'
      }, {
        label: 'Self Help',
        value: 'self'
      }]
    },
    address: {
      label: 'Address',
      type: Object,
      hidden: {
        delivery: {
          $ne: 'express'
        }
      }
    },
    message: {
      label: 'Buyer Message',
      type: String,
      multi: true
    },
    quantity: {
      label: 'Quantity',
      type: Number
    },
    currency: {
      label: 'Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
    },
    shipping: {
      // 邮费,不包含在total中,由各个OrderItem.shipping相加
      label: 'Shipping',
      type: 'money'
    },
    total: {
      // 由各个OrderItem.total相加而得,不包含邮费
      label: 'Total Amount',
      type: 'money'
    },
    deduction: {
      // 抵扣金额
      label: 'Deduction',
      type: 'money'
    },
    pay: {
      // 需要支付的金额 = total + shipping - deduction
      label: 'Pay Amount',
      type: 'money',
      disabled: true
    },
    payed: {
      label: 'Payed Amount',
      type: 'money'
    },
    deductionCurrency: {
      // 抵扣的货币，比如积分
      label: 'Deduction Currency',
      hidden: '!deductionCurrency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      switch: true,
    },
    deductionAccount: {
      label: 'Account',
      type: 'select:account'
    },
    deductionAmount: {
      // 抵扣的货币数量，可以与deduction不一致，允许积分和现金不等比
      label: 'Deduction Amount',
      type: 'money',
      currencyField: 'deductionCurrency',
      hidden: '!deductionAmount'
    },
    payment: {
      label: 'Payment',
      type: 'select',
      options: [] as any[]
    },
    refundedAmount: {
      label: 'Refunded Amount',
      type: 'money',
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
      type: 'money',
      hidden: '!refundAmount'
    },
    refundQuantity: {
      label: 'Refund Quantity',
      type: Number,
      hidden: '!refundQuantity'
    },
    lastRefundAmount: {
      label: 'Last Refund Amount',
      type: 'money',
      hidden: true,
      disabled: true
    },
    lastRefundQuantity: {
      label: 'Last Refund Quantity',
      type: Number,
      hidden: true,
      disabled: true
    },
    shipped: {
      label: 'Shipped',
      type: Boolean,
      hidden: true
    },
    closed: {
      label: 'Closed',
      type: Boolean,
      hidden: true
    },
    commented: {
      label: 'Commented',
      type: Boolean,
      optional: 'alaska-comment'
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      index: true,
      default: 200,
      options: [{
        label: 'Order_New',
        value: 200
      }, {
        label: 'Order_Payed',
        value: 300
      }, {
        label: 'Order_Confirmed',
        value: 400
      }, {
        label: 'Order_Shipped',
        value: 500
      }, {
        label: 'Order_Closed',
        value: 600
      }, {
        label: 'Order_Refund',
        value: 800
      }, {
        label: 'Order_Failed',
        value: 900
      }]
    },
    failure: {
      label: 'Failure Reason',
      type: String,
      hidden: '!failure'
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    payedAt: {
      label: 'Payed At',
      type: Date,
      hidden: '!payedAt'
    },
    paymentTimeout: {
      label: 'Payment Timeout',
      type: Date,
      hidden: '!paymentTimeout'
    },
    receivedAt: {
      label: 'Received At',
      type: Date,
      hidden: '!receivedAt'
    },
    receiveTimeout: {
      label: 'Receive Timeout',
      type: Date,
      hidden: '!receiveTimeout'
    },
    refundTimeout: {
      label: 'Refund Timeout',
      type: Date,
      hidden: '!refundTimeout'
    },
    userDeleted: {
      label: 'User Deleted',
      type: Boolean,
      protected: true,
      hidden: true
    },
    adminDeleted: {
      label: 'Admin Deleted',
      type: Boolean,
      private: true,
      hidden: true
    }
  };

  code: string;
  title: string;
  user: RecordId;
  store: string;
  shop: RecordId;
  type: any;
  pic: Image;
  goods: OrderGoods[];
  address: Address;
  delivery: 'express' | 'self' | string;
  message: string;
  quantity: number;
  currency: string;
  shipping: number;
  total: number;
  pay: number;
  payed: number;
  payment: string;
  deduction: number;
  deductionCurrency: string;
  deductionAccount: string;
  deductionAmount: number;
  /**
   * 订单已退款金额，总额
   */
  refundedAmount: number;
  /**
   * 客户已经退货的商品总数量
   */
  refundedQuantity: number;
  /**
   * 客户申请退款的原因
   */
  refundReason: string;
  /**
   * 客户申请退款的总金额
   * 如果退款审核通过，该值会重置为0
   */
  refundAmount: number;
  /**
   * 客户申请退货的总数量
   * 如果退款审核通过，该值会重置为0
   */
  refundQuantity: number;
  /**
   * 上一次审核通过的退款金额
   */
  lastRefundAmount: number;
  /**
   * 上一次审核通过的退货数量
   */
  lastRefundQuantity: number;
  shipped: boolean;
  closed: boolean;
  state: number;
  failure: string;
  createdAt: Date;
  payedAt: Date;
  receivedAt: Date;
  paymentTimeout: Date;
  receiveTimeout: Date;
  refundTimeout: Date;
  userDeleted: boolean;
  adminDeleted: boolean;
  commented: boolean;

  // for alaska dev
  needConfirm: boolean;
  _logTotal: boolean;
  _logShipping: boolean;
  _logDeduction: boolean;
  _stateChanged: boolean;

  async preValidate() {
    if (this.address && !_.isObject(this.address)) {
      throw new NormalError('Address format error!');
    }
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.code) {
      this.code = await service.config.get('codeCreator')(this);
    }
  }

  preSave() {
    if (this.isNew) {
      this.pay = (this.total || 0) + (this.shipping || 0) - (this.deduction || 0);
    }
    this._logTotal = !this.isNew && this.isModified('total');
    this._logShipping = !this.isNew && this.isModified('shipping');
    this._logDeduction = !this.isNew && this.isModified('deduction');
    this._stateChanged = this.isNew || this.isModified('state');
  }

  async postSave() {
    if (this._logTotal) {
      this.createLog('Modified total price', this.$session());
    }
    if (this._logShipping) {
      this.createLog('Modified shipping fee', this.$session());
    }
    if (this._logDeduction) {
      this.createLog('Modified deduction', this.$session());
    }
    if (this._stateChanged && this.goods && this.goods.length) {
      await OrderGoods.updateMany({ order: this._id }, { state: this.state }).session(this.$session()).exec();
    }
  }

  /**
   * 创建并保存订单日志
   * @param title
   * @returns {*}
   */
  createLog(title: string, dbSession?: mongodb.ClientSession): OrderLog {
    let log = new OrderLog({ title, order: this, state: this.state, user: this.user, shop: this.shop });
    log.save({ session: dbSession });
    return log;
  }

  /**
   * 判断某个GoodsItem能不能合并到此订单
   * @param {OrderGoods} goods
   * @returns {boolean}
   */
  canAppendGoods(goods: OrderGoods): boolean {
    if (this.shop) {
      return isIdEqual(this.shop, goods.shop);
    }
    return !goods.shop;
  }
}
