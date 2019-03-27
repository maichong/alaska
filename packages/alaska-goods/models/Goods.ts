import * as mongodb from 'mongodb';
import { RecordId, Model } from 'alaska-model';
import { Context } from 'alaska-http';
import Category from 'alaska-category/models/Category';
import { Sku } from 'alaska-sku';
import { Image } from 'alaska-field-image';

function defaultFilters(ctx: Context) {
  if (ctx.shop || ctx.service.id === 'alaska-admin' || ctx.state.apiAction === 'show') return null;
  return {
    activated: true
  };
}

export default class Goods extends Model {
  static label = 'Goods';
  static icon = 'gift';
  static defaultColumns = 'pic title shop brand cat cats price discount volume inventory activated recommend isHot sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';
  static filterFields = 'cat shop brand price?range recommend activated @search';

  static api = {
    count: 1,
    paginate: 1,
    list: 1,
    show: 1,
    create: 2,
    update: 2,
    remove: 2
  };

  static defaultFilters = defaultFilters;

  static scopes = {
    list: 'title shop brand pic brief recommend isHot cat price discount discountStartAt discountEndAt volume inventory'
  };

  static groups = {
    inventory: {
      title: 'Inventory'
    },
    price: {
      title: 'Price'
    },
    desc: {
      title: 'Description'
    }
  };

  static fields = {
    title: {
      label: 'Title',
      type: String,
      required: true
    },
    brief: {
      label: 'Brief',
      type: String
    },
    pic: {
      label: 'Main Picture',
      type: 'image',
      view: ''
    },
    pics: {
      label: 'Pictures',
      type: 'image',
      multi: true,
      cell: ''
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
      index: true
    },
    brand: {
      label: 'Brand',
      type: 'relationship',
      ref: 'alaska-brand.Brand',
      optional: 'alaska-brand',
      index: true
    },
    cat: {
      label: 'Category',
      type: 'category',
      ref: Category,
      index: true,
      filters: {
        group: 'goods'
      }
    },
    cats: {
      label: 'Categories',
      type: 'relationship',
      ref: Category,
      index: true,
      multi: true,
      protected: true,
      hidden: true
    },
    recommend: {
      label: 'Recommend',
      type: Boolean
    },
    isHot: {
      label: 'Is Hot Goods',
      type: Boolean
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      protected: true
    },
    seoTitle: {
      label: 'SEO Title',
      type: String,
      default: ''
    },
    seoKeywords: {
      label: 'SEO Keywords',
      type: String,
      default: ''
    },
    seoDescription: {
      label: 'SEO Description',
      type: String,
      default: ''
    },
    currency: {
      label: 'Currency',
      type: 'relationship',
      ref: 'alaska-currency.Currency',
      optional: 'alaska-currency',
      defaultField: 'isDefault',
      switch: true,
      group: 'price'
    },
    price: {
      label: 'Price',
      type: 'money',
      group: 'price',
      min: 0,
      disabled: {
        'skus.length': {
          $gt: 0
        }
      }
    },
    discount: {
      label: 'Discount',
      type: 'money',
      help: '0 for no discount',
      group: 'price',
      min: 0,
      disabled: {
        'skus.length': {
          $gt: 0
        }
      }
    },
    discountStartAt: {
      label: 'Discount Start',
      type: Date,
      group: 'price'
    },
    discountEndAt: {
      label: 'Discount End',
      type: Date,
      group: 'price'
    },
    shipping: {
      label: 'Shipping',
      type: 'money',
      group: 'price',
      min: 0,
      default: 0
    },
    shippingShareLimit: {
      label: 'Shipping Share Limit',
      type: Number,
      precision: 0,
      min: 0,
      default: 1,
      group: 'price',
      hidden: '!shipping',
      help: 'shippingShareLimit_help'
    },
    inventory: {
      label: 'Inventory',
      type: Number,
      min: 0,
      default: 0,
      group: 'inventory',
      disabled: {
        'skus.length': {
          $gt: 0
        }
      }
    },
    volume: {
      label: 'Volume',
      type: Number,
      default: 0,
      min: 0,
      group: 'inventory',
      disabled: {
        'skus.length': {
          $gt: 0
        }
      }
    },
    sort: {
      label: 'Sort',
      type: Number,
      default: 0,
      protected: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    },
    commentCount: {
      label: 'Comments Count',
      type: Number,
      default: 0,
      min: 0,
      optional: 'alaska-comment'
    },
    desc: {
      label: 'Description',
      type: 'html',
      default: '',
      group: 'desc',
      horizontal: false,
      nolabel: true
    }
  };

  static virtuals = {
    get discountValid() {
      let now = new Date();
      return (!this.discountStartAt || this.discountStartAt < now) && (!this.discountEndAt || this.discountEndAt > now);
    }
  };


  title: string;
  brief: string;
  pic: Image;
  pics: Image[];
  store: string;
  cat: RecordId;
  cats: RecordId[];
  brand: RecordId;
  shop: RecordId;
  recommend: boolean;
  isHot: boolean;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  currency: string;
  price: number;
  discount: number;
  discountStartAt: Date;
  discountEndAt: Date;
  shipping: number;
  shippingShareLimit: number;
  inventory: number;
  volume: number;
  sort: number;
  activated: boolean;
  createdAt: Date;
  desc: string;
  discountValid: boolean;

  // for alaska dev
  skus: Sku[];

  /**
   * 增加商品库存，如果增加成功，返回新的商品记录，否则返回null
   * @param id 商品ID
   * @param quantity 增加数量
   */
  static async incInventory(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Goods | null> {
    // 更新 Goods 表
    return await Goods.findOneAndUpdate(
      { _id: id },
      { $inc: { inventory: quantity } },
      { new: true }
    ).session(dbSession);
  }

  /**
   * 增加商品销量，如果增加成功，返回新的商品记录，否则返回null
   * @param id 商品ID
   * @param quantity 增加数量
   */
  static async incVolume(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Goods | null> {
    // 更新 Goods 表
    return await Goods.findOneAndUpdate(
      { _id: id },
      { $inc: { volume: quantity } },
      { new: true }
    ).session(dbSession);
  }

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    if ((this.isNew || this.isModified('pics')) && this.pics.length) {
      this.pic = this.pics[0];
    }

    if (this.isModified('cat')) {
      let cat: Category = await Category.findById(this.cat);
      this.cats = cat ? cat.parents.concat([this.cat]) : [this.cat];
    }
  }
}
