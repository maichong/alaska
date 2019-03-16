import { RecordId, Model } from 'alaska-model';

export default class OrderLog extends Model {
  static label = 'Order Log';
  static icon = 'hourglass-2';
  static defaultColumns = 'title order state createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noupdate = true;
  static noremove = true;

  static api = {
    list: 2
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true,
      translate: true
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
      ref: 'alaska-user.User',
      hidden: true
    },
    shop: {
      label: 'Shop',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop',
      hidden: true
    },
    state: {
      label: 'State',
      type: 'select',
      number: true,
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
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  order: RecordId;
  user: RecordId;
  shop: RecordId;
  state: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
