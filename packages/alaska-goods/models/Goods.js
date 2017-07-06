// @flow

import _ from 'lodash';
import alaska, { Model } from 'alaska';
import BALANCE from 'alaska-balance';
import Sku from './Sku';
import GoodsCat from './GoodsCat';

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

  static defaultFilters = (ctx) => {
    if (ctx.service.id === 'alaska-admin') return null;
    return {
      activated: true
    };
  };

  static populations = {
    skus: {
      match: {
        inventory: { $gt: 0 },
        valid: true
      }
    }
  };

  static scopes = {
    list: 'title pic price discount inventory hasSku _skus'
  };

  static groups = {
    price: {
      title: 'Price'
    },
    inventory: {
      title: 'Inventory'
    },
    props: {
      title: 'Goods Properties'
    },
    sku: {
      title: 'SKU',
      panel: false
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
      required: true
    },
    pics: {
      label: 'Other Pictures',
      type: 'image',
      multi: true
    },
    cat: {
      label: 'Category',
      type: 'category',
      ref: GoodsCat,
      index: true
    },
    cats: {
      label: 'Categories',
      ref: ['GoodsCat'],
      private: true,
      hidden: true
    },
    brand: {
      label: 'Brand',
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
      options: BALANCE.currencies,
      default: BALANCE.defaultCurrency.value,
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
      label: 'Discount Start At',
      type: Date,
      group: 'price'
    },
    discountEndAt: {
      label: 'Discount End At',
      type: Date,
      group: 'price'
    },
    shipping: {
      label: 'Shipping',
      type: Number,
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
      private: true
    },
    activated: {
      label: 'Activated',
      type: Boolean,
      private: true
    },
    props: {
      label: 'Goods Properties',
      type: Object,
      view: 'GoodsPropsEditor',
      group: 'props'
    },
    propValues: {
      label: 'Properties Values',
      ref: ['GoodsPropValue'],
      hidden: true,
      private: true
    },
    skus: {
      label: 'SKU',
      ref: ['Sku'],
      hidden: true
    },
    sku: {
      type: Object,
      view: 'GoodsSkuEditor',
      group: 'sku',
      private: true
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
  _id: string|number|Object|any;
  title: string;
  brief: string;
  pic: Object;
  pics: Object[];
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
  props: Object;
  propValues: Object[];
  skus: Object[];
  sku: Object;
  createdAt: Date;
  desc: string;

  static virtuals = {
    get discountValid() {
      let now = new Date();
      return this.discount > 0 && this.discountStartAt < now && this.discountEndAt > now;
    },
    get hasSku() {
      return this.skus && this.skus.length > 0;
    }
  };

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    if (this.isModified('cat') || !this.cats || !this.cats.length) {
      this.cats = [];
      // $Flow
      let cat: GoodsCat = await GoodsCat.findById(this.cat);
      if (cat) {
        let cats = await cat.parents();
        cats.unshift(cat);
        this.cats = cats.map((c) => c._id);
      }
    }

    //如果商品属性发生更改,重建属性值索引,供前端检索
    if (this.isModified('props')) {
      let propValues = [];
      _.each(this.props, (prop) => {
        if (prop.filter) {
          _.each(prop.values, (value) => {
            // $Flow util 未定义
            if (alaska.util.isObjectId(value.value)) {
              propValues.push(value.value);
            }
          });
        }
      });
      this.propValues = propValues;
    }

    //如果在后台修改了SKU,更新SKU记录
    if (this.isModified('sku')) {
      let skuIds: any[] = [];
      // $Flow
      let skus: Sku[] = await Sku.find({
        goods: this.id
      });
      let skusMap = {};
      let skusMapByKey = {};
      skus.forEach((s: Sku) => {
        skusMap[s.id] = s;
        skusMapByKey[s.key] = s;
      });
      for (let s of this.sku) {
        let sku: ?Sku;
        if (s.id) {
          sku = skusMap[s.id];
        }
        if (!sku) {
          sku = skusMapByKey[s.key];
        }
        if (!s.valid && !sku) {
          //没有找到,并且提交的是无效记录
          //跳过此条
          return;
        }
        if (s.valid && !sku) {
          sku = new Sku({
            goods: this.id
          });
        }
        sku.pic = s.pic;
        sku.valid = s.valid;
        sku.price = s.price;
        sku.discount = s.discount;
        sku.inventory = s.inventory;
        sku.desc = s.desc;
        sku.key = s.key;
        sku.props = s.props;
        sku.save();
        sku.__exist = true;
        skuIds.push(sku._id);
      }
      for (let sku of skus) {
        if (!sku.__exist) {
          sku.remove();
        }
      }
      this.skus = skuIds;
    }
  }
}
