import { RecordId, Model } from 'alaska-model';

export default class OrderGoods extends Model {
  static label = 'Order Item';
  static icon = 'list-ol';
  static defaultColumns = 'title order goods skuDesc price discount total quantity createdAt';
  static titleField = 'order goods user @search';
  static searchFields = '@title';
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
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User'
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
      hidden: true
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods'
    },
    sku: {
      label: 'SKU',
      type: 'relationship',
      ref: 'alaska-sku.Sku',
      optional: 'alaska-sku'
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
    state: {
      label: 'State',
      type: 'select',
      number: true,
      hidden: true,
      disabled: true,
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
    quantity: {
      label: 'Quantity',
      type: Number
    },
    currency: {
      label: 'Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      switch: true,
    },
    price: {
      label: 'Price',
      type: 'money'
    },
    discount: {
      label: 'Discount',
      type: 'money'
    },
    shipping: {
      label: 'Shipping',
      type: 'money'
    },
    total: {
      // total = (discount || price) * quantity
      label: 'Total Amount',
      type: 'money'
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
    comment: {
      label: 'Comment',
      type: 'relationship',
      ref: 'alaska-comment.Comment',
      optional: 'alaska-comment'
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  pic: Object;
  title: string;
  order: RecordId;
  user: RecordId;
  store: string;
  shop: RecordId;
  goods: RecordId;
  comment: RecordId;
  sku?: RecordId;
  skuKey: string;
  skuDesc: string;
  state: number;
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
  /**
   * 当前申请退款原因
   */
  refundReason: string;
  /**
   * 当前申请退款金额
   */
  refundAmount: number;
  /**
   * 当前申请退货数量
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
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
