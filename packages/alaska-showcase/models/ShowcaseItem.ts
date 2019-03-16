import { Model } from 'alaska-model';

export default class ShowcaseItem extends Model {
  static label = 'Showcase Item';
  static hidden = true;

  static fields = {
    pic: {
      label: 'Picture',
      type: 'image'
    },
    action: {
      label: 'Action',
      type: 'select',
      switch: true,
      default: 'url',
      options: [{
        label: 'URL',
        value: 'url'
      }, {
        label: 'Goods',
        value: 'goods',
        optional: 'alaska-goods'
      }, {
        label: 'Goods List',
        value: 'goods-list',
        optional: 'alaska-goods'
      }, {
        label: 'Post',
        value: 'post',
        optional: 'alaska-post'
      }]
    },
    url: {
      label: 'URL',
      type: String,
      hidden: {
        action: {
          $ne: 'url'
        }
      }
    },
    post: {
      label: 'Post',
      type: 'relationship',
      ref: 'alaska-post.Post',
      optional: 'alaska-post',
      hidden: {
        action: {
          $ne: 'post'
        }
      }
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      optional: 'alaska-goods',
      hidden: {
        action: {
          $ne: 'goods'
        }
      }
    },
    category: {
      label: 'Category',
      type: 'relationship',
      ref: 'alaska-category.Category',
      optional: 'alaska-category',
      hidden: {
        action: {
          $ne: 'goods-list'
        }
      }
    },
    search: {
      label: '搜索词',
      type: String,
      after: 'action',
      hidden: {
        action: {
          $ne: 'goods-list'
        }
      }
    },
    height: {
      label: 'Height',
      type: Number
    },
    width: {
      label: 'Width',
      type: Number
    }
  };
}
