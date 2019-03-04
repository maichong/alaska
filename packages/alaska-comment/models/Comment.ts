import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class Comment extends Model {
  static label = 'Comment';
  static icon = 'commenting';
  static defaultColumns = 'type user content createdAt';
  static defaultSort = '-createdAt';

  static api = {
    paginate: 1,
    list: 1,
    show: 1,
  };

  static fields = {
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User'
    },
    type: {
      label: 'Type',
      type: 'select',
      required: true,
      options: [{
        label: 'Default',
        value: 'default'
      }]
    },
    order: {
      label: 'Order',
      type: 'relationship',
      ref: 'alaska-order.Order',
      optional: 'alaska-order.Order',
      protected: true,
      hidden: '!order'
    },
    orderGoods: {
      label: 'Order Goods',
      type: 'relationship',
      ref: 'alaska-order.OrderGoods',
      optional: 'alaska-order.OrderGoods',
      protected: true,
      hidden: '!orderGoods'
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods.Goods',
      protected: true,
      hidden: '!goods'
    },
    content: {
      label: 'Title',
      type: String,
      required: true
    },
    pic: {
      label: 'Main Picture',
      type: 'image',
      view: '',
      hidden: true
    },
    pics: {
      label: 'Pictures',
      type: 'image',
      multi: true,
      cell: ''
    },
    reply: {
      label: 'Reply',
      type: 'relationship',
      ref: 'alaska-comment.Comment',
      default: null as any
    },
    parents: {
      label: 'Parent comments',
      type: 'relationship',
      ref: 'alaska-comment.Comment',
      multi: true,
      protected: true,
      hidden: true
    },
    level: {
      label: 'Level',
      type: Number,
      default: 1,
      hidden: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  type: string;
  content: string;
  pic: Image;
  pics: Image[];
  order: RecordId;
  orderGoods: RecordId;
  goods: RecordId;
  reply: RecordId;
  parents: RecordId[];
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
