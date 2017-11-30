'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _utils = require('alaska/utils');

var utils = _interopRequireWildcard(_utils);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _Sku = require('./Sku');

var _Sku2 = _interopRequireDefault(_Sku);

var _GoodsCat = require('./GoodsCat');

var _GoodsCat2 = _interopRequireDefault(_GoodsCat);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Goods extends _alaska.Model {

  async preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    if (this.isModified('cat') || !this.cats || !this.cats.length) {
      this.cats = [];
      // $Flow
      let cat = await _GoodsCat2.default.findById(this.cat);
      if (cat) {
        let cats = await cat.parents();
        cats.unshift(cat);
        this.cats = cats.map(c => c._id);
      }
    }

    //如果商品属性发生更改,重建属性值索引,供前端检索
    if (this.isModified('props')) {
      let propValues = [];
      _lodash2.default.each(this.props, prop => {
        if (prop.filter) {
          _lodash2.default.each(prop.values, value => {
            if (utils.isObjectId(value.value)) {
              propValues.push(value.value);
            }
          });
        }
      });
      this.propValues = propValues;
    }

    //如果在后台修改了SKU,更新SKU记录
    if (this.isModified('sku')) {
      let skuIds = [];
      // $Flow
      let skus = await _Sku2.default.find({
        goods: this.id
      });
      let skusMap = {};
      let skusMapByKey = {};
      skus.forEach(s => {
        skusMap[s.id] = s;
        skusMapByKey[s.key] = s;
      });
      for (let s of this.sku) {
        let sku;
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
          sku = new _Sku2.default({
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
exports.default = Goods;
Goods.label = 'Goods';
Goods.icon = 'gift';
Goods.defaultColumns = 'pic title cat cats price inventory activated sort createdAt';
Goods.defaultSort = '-sort';
Goods.searchFields = 'title';
Goods.api = {
  paginate: 1,
  show: 1
};

Goods.defaultFilters = ctx => {
  if (ctx.service.id === 'alaska-admin') return null;
  return {
    activated: true
  };
};

Goods.populations = {
  skus: {
    match: {
      inventory: { $gt: 0 },
      valid: true
    }
  }
};
Goods.scopes = {
  list: 'title pic price discount inventory hasSku _skus'
};
Goods.groups = {
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
Goods.fields = {
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
    ref: _GoodsCat2.default,
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
    options: _alaskaBalance2.default.getCurrenciesAsync(),
    default: _alaskaBalance2.default.getDefaultCurrencyAsync().then(cur => cur.value),
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
Goods.virtuals = {
  get discountValid() {
    let now = new Date();
    return this.discount > 0 && this.discountStartAt < now && this.discountEndAt > now;
  },
  get hasSku() {
    return this.skus && this.skus.length > 0;
  }
};