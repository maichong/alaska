import { Model } from 'alaska-model';
import { Context } from 'alaska-http';
import * as moment from 'moment';

function defaultFilters(ctx: Context) {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true,
    startAt: { $lte: new Date() },
    endAt: { $gte: new Date() }
  };
}

export default class Banner extends Model {
  static label = 'Banner';
  static icon = 'picture-o';
  static defaultSort = '-sort';
  static defaultColumns = 'pic title position sort clicks activated startAt endAt';
  static defaultFilters = defaultFilters;
  static api = {
    list: 1
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    pic: {
      label: 'Picture',
      type: 'image',
      required: true
    },
    place: {
      label: 'Place',
      type: 'select',
      default: 'default',
      options: [{
        label: 'Default',
        value: 'default'
      }]
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
        optional: 'alaska-goods.Goods'
      }, {
        label: 'Goods List',
        value: 'goods-list',
        optional: 'alaska-goods.Goods'
      }, {
        label: 'Post',
        value: 'post',
        optional: 'alaska-post.Post'
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
      optional: 'alaska-post.Post',
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
      optional: 'alaska-goods.Goods',
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
      optional: 'alaska-category.Category',
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
    sort: {
      label: 'Sort',
      type: Number,
      default: 0,
      protected: true
    },
    clicks: {
      label: 'Clicks',
      type: Number,
      default: 0,
      disabled: true,
      protected: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      default: true,
      protected: true
    },
    startAt: {
      label: 'Start At',
      type: Date,
      protected: true
    },
    endAt: {
      label: 'End At',
      type: Date,
      protected: true,
      index: true
    },
    createdAt: {
      label: 'Created At',
      type: Date,
      hidden: '!createdAt',
      protected: true
    }
  };

  title: string;
  pic: Object;
  position: string;
  action: string;
  url: string;
  sort: number;
  clicks: number;
  activated: boolean;
  startAt: Date;
  endAt: Date;
  createdAt: Date;

  preSave() {
    if (!this.startAt) {
      this.startAt = new Date();
    }
    if (!this.endAt) {
      this.endAt = moment(this.startAt).add(1, 'year').endOf('year').toDate();
    }
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  isValid() {
    let now = new Date();
    return this.activated && this.startAt < now && this.endAt > now;
  }
}
