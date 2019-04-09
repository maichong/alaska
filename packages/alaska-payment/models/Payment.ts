import { RecordId, Model } from 'alaska-model';

export default class Payment extends Model {
  static label = 'Payment Logs';
  static icon = 'money';
  static defaultColumns = 'title user type amount state createdAt';
  static filterFields = 'state?switch&nolabel currency?switch user amount?range';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noupdate = true;

  static api = {
    create: 2
  };

  static actions = {
    complete: {
      title: 'Complete',
      sled: 'Complete',
      color: 'warning',
      confirm: 'COMPLETE_PAYMENT_WARING',
      hidden: 'state'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      protected: true
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      protected: true
    },
    type: {
      label: 'Payment Type',
      type: 'select:payment',
      options: [] as any[],
      required: true
    },
    currency: {
      label: 'Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
    },
    amount: {
      label: 'Amount',
      type: 'money',
      required: true,
      protected: true
    },
    ip: {
      label: 'IP',
      type: String,
      protected: true
    },
    params: {
      label: 'Params',
      type: String
    },
    state: {
      label: 'State',
      type: 'select',
      default: 'pending',
      options: [{
        label: 'Pending',
        value: 'pending'
      }, {
        label: 'Success',
        value: 'success'
      }, {
        label: 'Failed',
        value: 'failed'
      }]
    },
    failure: {
      label: 'Failure Reason',
      type: String
    },
    callbackData: {
      label: 'Callback Data',
      type: Object,
      protected: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  user: RecordId;
  currency: string;
  amount: number;
  type: string;
  ip: string;
  params: any;
  state: 'pending' | 'success' | 'failed';
  failure: string;
  callbackData: any;
  createdAt: Date;

  // for alaska dev
  orders: any[];
  recharge: RecordId;
  openid: string;
  weixinTransactionId: string;

  alipayBizContent: any;
  alipayTradeNo: string;
  alipayBuyerId: string;
  alipayBuyerLogonId: string;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
