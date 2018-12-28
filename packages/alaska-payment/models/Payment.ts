import { RecordId, Model } from 'alaska-model';
import { BalanceService } from 'alaska-balance';
import service from '..';

async function getCurrenciesAsync() {
  await service.resolveConfig();
  let balanceService = service.main.allServices['alaska-balance'] as BalanceService;
  if (balanceService) {
    return await balanceService.getCurrenciesAsync();
  }
  return [];
}

async function getDefaultCurrencyAsync() {
  await service.resolveConfig();
  let balanceService = service.main.allServices['alaska-balance'] as BalanceService;
  if (balanceService) {
    return await balanceService.getDefaultCurrencyAsync();
  }
  return { value: '' };
}

export default class Payment extends Model {
  static label = 'Payment Logs';
  static icon = 'money';
  static defaultColumns = 'title user type amount state createdAt';
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
      type: 'select',
      options: [] as any[],
      required: true
    },
    currency: {
      label: 'Currency',
      type: 'select',
      options: getCurrenciesAsync(),
      default: getDefaultCurrencyAsync().then((cur) => cur.value)
    },
    amount: {
      label: 'Amount',
      type: Number,
      required: true,
      protected: true
    },
    params: {
      label: 'Params',
      type: Object,
      required: true
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
      default: 0,
      options: [{
        label: 'Pending',
        value: 0
      }, {
        label: 'Success',
        value: 1
      }, {
        label: 'Failed',
        value: -1
      }]
    },
    failure: {
      label: 'Failure Reason',
      type: String
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
  params: any;
  state: number;
  failure: string;
  createdAt: Date;

  // for alaska dev
  orders: any[];

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
