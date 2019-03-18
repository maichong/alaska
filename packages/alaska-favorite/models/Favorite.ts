import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class Favorite extends Model {
  static label = 'Favorite';
  static icon = 'heart';
  static defaultColumns = 'pic title user createdAt';
  static filterFields = 'user type createdAt?range';
  static defaultSort = '-createdAt';

  static api = {
    list: 2,
    create: 2,
    remove: 2
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    pic: {
      label: 'Picture',
      type: 'image'
    },
    user: {
      label: 'User',
      type: 'relationship',
      ref: 'alaska-user.User',
      index: true
    },
    type: {
      //收藏目标的模型,例如 alaska-goods.Goods
      label: 'Type',
      type: 'select',
      options: [{
        label: 'Goods',
        value: 'alaska-goods.Goods' //此处是ModelId
      }]
    },
    goods: {// 收藏的商品
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      hidden: {
        type: { $ne: 'alaska-goods.Goods' }
      }
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  title: string;
  pic: Image;
  user: RecordId;
  type: string;
  goods: RecordId;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
