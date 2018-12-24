import { Model } from 'alaska-model';
import User from 'alaska-user/models/User';
import balanceService from 'alaska-balance';
import OrderLog from './OrderLog';
import OrderGoods from './OrderGoods';
import { Context } from 'alaska-http';
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
  static defaultColumns = 'code pic title user total state createdAt';
  static defaultSort = '-createdAt';
  static searchFields = 'title';
  static nocreate = true;
  static noremove = true;
  static listLimit = 100;

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
      title: 'Confirm',
      style: 'success',
      sled: 'Confirm',
      hidden: {
        state: {
          $ne: 300
        }
      }
    },
    ship: {
      title: 'Ship',
      style: 'success',
      sled: 'Ship',
      hidden: {
        state: {
          $ne: 400
        }
      }
    },
    delete: {
      title: 'Delete',
      style: 'danger',
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
    address: {
      label: 'Address',
      type: Object
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    shipping: {
      //邮费,不包含在total中,由各个OrderItem.shipping相加
      label: 'Shipping',
      type: Number,
      default: 0
    },
    total: {
      //由各个OrderItem.total相加而得,不包含邮费
      label: 'Total Amount',
      type: Number
    },
    pay: {
      label: 'Pay Amount',
      type: Number
    },
    payed: {
      label: 'Payed Amount',
      type: Number,
      default: 0
    },
    payment: {
      label: 'Payment',
      type: 'select',
      options: [{
        label: 'Balance',
        value: 'balance'
      }]
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
      depends: 'failure'
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    paymentTimeout: {
      label: 'Payment Timeout',
      type: Date,
      hidden: '!paymentTimeout'
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
  user: User;
  type: any;
  pic: Object;
  goods: OrderGoods[];
  address: Object;
  currency: string;
  shipping: number;
  total: number;
  pay: number;
  payed: number;
  payment: string;
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
  shipped: boolean;
  closed: boolean;
  state: number;
  failure: string;
  createdAt: Date;
  paymentTimeout: Date;
  receiveTimeout: Date;
  refundTimeout: Date;
  userDeleted: boolean;
  adminDeleted: boolean;

  _logTotal: boolean;
  _logShipping: boolean;

  async preValidate() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.code) {
      this.code = await service.config.get('codeCreator')(this);
    }
  }

  preSave() {
    this.pay = (this.total || 0) + (this.shipping || 0);
    this._logTotal = !this.isNew && this.isModified('total');
    this._logShipping = !this.isNew && this.isModified('shipping');
  }

  postSave() {
    if (this._logTotal) {
      this.createLog('Modified total price');
    }
    if (this._logShipping) {
      this.createLog('Modified shipping fee');
    }
  }

  /**
   * 创建并保存订单日志
   * @param title
   * @returns {*}
   */
  createLog(title: string): OrderLog {
    let log = new OrderLog({ title, order: this, state: this.state, user: this.user });
    log.save();
    return log;
  }

  /**
   * 判断某个GoodsItem能不能合并到此订单
   * @param {OrderGoods} goods
   * @returns {boolean}
   */
  canAppendGoods(goods: OrderGoods): boolean {
    return !!goods;
  }
}
