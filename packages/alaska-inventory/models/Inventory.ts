import { Model, RecordId } from 'alaska-model';

export default class Inventory extends Model {
  static label = 'Inventory History';
  static icon = 'truck';
  static defaultColumns = 'goods sku type quantity inventory desc createdAt';
  static defaultSort = '-createdAt';
  static nocreate = true;
  static noupdate = true;

  static api = {
    paginate: 2,
    list: 2,
    create: 2,
    count: 2
  };

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      required: true,
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      required: true,
      index: true
    },
    sku: {
      label: 'SKU',
      type: 'relationship',
      ref: 'alaska-sku.Sku',
      optional: true
    },
    type: {
      label: 'Type',
      type: 'select',
      switch: true,
      default: 'input',
      options: [{
        label: 'Input',
        value: 'input'
      }, {
        label: 'Output',
        value: 'output'
      }]
    },
    quantity: {
      label: 'Quantity',
      type: Number,
      required: true
    },
    inventory: {
      label: 'Residual Inventory',
      type: Number
    },
    desc: {
      label: 'Description',
      type: String,
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  user: RecordId;
  goods: RecordId;
  sku: RecordId;
  type: 'input' | 'output';
  quantity: number;
  inventory: number;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (this.type === 'input') {
      if (!this.quantity || this.quantity <= 0) {
        throw new Error('invalid quantity');
      }
    } else {
      if (!this.quantity || this.quantity >= 0) {
        throw new Error('invalid quantity');
      }
    }
  }
}
