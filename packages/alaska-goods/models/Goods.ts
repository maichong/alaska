import { Model } from 'alaska-model';
import { Context } from 'alaska-http';
import balanceService from 'alaska-balance';
import Category from 'alaska-category/models/Category';
import { Sku } from 'alaska-sku';

function defaultFilters(ctx: Context) {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
}

export default class Goods extends Model {
  static label = 'Goods';
  static icon = 'gift';
  static defaultColumns = 'pic title cat cats price inventory activated sort createdAt';
  static defaultSort = '-sort';
  static searchFields = 'title';

  static api = {
    paginate: 1,
    show: 1
  };

  static defaultFilters = defaultFilters;

  static scopes = {
    list: 'title pic price discount discountStartAt discountEndAt inventory'
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
      hidden: true
    },
    pics: {
      label: 'Pictures',
      type: 'image',
      multi: true,
      cell: ''
    },
    cat: {
      label: 'Category',
      type: 'category',
      ref: Category,
      index: true
    },
    cats: {
      label: 'Categories',
      type: 'relationship',
      ref: Category,
      multi: true,
      protected: true,
      hidden: true
    },
    brand: {
      label: 'Brand',
      type: 'relationship',
      ref: 'Brand',
      index: true
    },
    newGoods: {
      label: 'Is New Goods',
      type: Boolean
    },
    hotGoods: {
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
      type: 'select',
      switch: true,
      options: balanceService.getCurrenciesAsync(),
      default: balanceService.getDefaultCurrencyAsync().then((cur) => cur.value),
      group: 'price'
    },
    price: {
      label: 'Price',
      type: Number,
      default: 0,
      format: '0.00',
      group: 'price'
    },
    discount: {
      label: 'Discount',
      type: Number,
      default: 0,
      format: '0.00',
      help: '0 for no discount',
      group: 'price'
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
      type: Number,
      format: '0.00',
      group: 'price',
      default: 0
    },
    inventory: {
      label: 'Inventory',
      type: Number,
      default: 0,
      group: 'inventory'
    },
    volume: {
      label: 'Volume',
      type: Number,
      default: 0,
      group: 'inventory'
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
      return this.discount > 0 && (!this.discountStartAt || this.discountStartAt < now) && (!this.discountEndAt || this.discountEndAt > now);
    }
  };

  title: string;
  brief: string;
  pic: Object;
  pics: Object[];
  cat: Object;
  cats: Object[];
  brand: Object;
  newGoods: boolean;
  hotGoods: boolean;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  currency: any;
  price: number;
  discount: number;
  discountStartAt: Date;
  discountEndAt: Date;
  shipping: number;
  inventory: number;
  volume: number;
  sort: number;
  activated: boolean;
  createdAt: Date;
  desc: string;
  discountValid: boolean;

  // for alaska dev
  skus: Sku[];

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    if ((this.isNew || this.isModified('pics')) && this.pics.length) {
      this.pic = this.pics[0];
    }

    if (this.isModified('cat')) {
      let cat: Category = await Category.findById(this.cat);
      this.cats = cat ? cat.parents : [];
    }
  }
}
