import { Model, RecordId } from 'alaska-model';
import { Image } from 'alaska-field-image';

export default class Favorite extends Model {
  static label = 'Favorite';
  static icon = 'heart';
  static defaultColumns = 'pic title user type goods shop brand post createdAt';
  static filterFields = 'type?switch&nolabel user createdAt?range';
  static defaultSort = '-createdAt';

  static api = {
    list: 2,
    paginate: 2,
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
      required: true,
      index: true
    },
    type: {
      // 收藏目标的模型,例如 alaska-goods.Goods
      label: 'Type',
      type: 'select',
      switch: true,
      required: true,
      options: [{
        label: 'Goods',
        value: 'goods',
        optional: 'alaska-goods'
      }, {
        label: 'Shop',
        value: 'shop',
        optional: 'alaska-shop'
      }, {
        label: 'Brand',
        value: 'brand',
        optional: 'alaska-brand'
      }, {
        label: 'Post',
        value: 'post',
        optional: 'alaska-post'
      }]
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods',
      hidden: {
        type: { $ne: 'goods' }
      }
    },
    shop: {
      label: 'Shop',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop',
      hidden: {
        type: { $ne: 'shop' }
      }
    },
    brand: {
      label: 'Brand',
      type: 'relationship',
      ref: 'alaska-brand.Brand',
      optional: 'alaska-brand',
      hidden: {
        type: { $ne: 'brand' }
      }
    },
    post: {
      label: 'Post',
      type: 'relationship',
      ref: 'alaska-post.Post',
      optional: 'alaska-post',
      hidden: {
        type: { $ne: 'post' }
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
  shop: RecordId;
  brand: RecordId;
  post: RecordId;
  createdAt: Date;

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
