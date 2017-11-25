'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _Goods = require('alaska-goods/models/Goods');

var _Goods2 = _interopRequireDefault(_Goods);

var _Sku = require('alaska-goods/models/Sku');

var _Sku2 = _interopRequireDefault(_Sku);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _CartItem = require('../models/CartItem');

var _CartItem2 = _interopRequireDefault(_CartItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Create extends _alaska.Sled {
  /**
   * 加入购物车
   * @param params
   *        params.user 用户记录
   *        params.goodsId 商品ID
   *        [params.skuId] SKU ID
   *        [params.quantity] 数量
   */
  async exec(params) {
    let {
      user, goodsId, skuId, quantity
    } = params;
    let sku;
    let goods;

    let goodsTmp = await _Goods2.default.findById(goodsId);

    goods = goodsTmp;

    if (!goods) _2.default.error('goods is not found');
    let discountValid = goods.discountValid;
    let discount = discountValid ? goods.discount : 0;
    let filters = { user: user._id, goods: goodsId, sku: '' };
    if (skuId) {
      let skuTmp = await _Sku2.default.findById(params.skuId);

      sku = skuTmp;
      if (!sku) _2.default.error('Can not find sku');
      if (sku.goods.toString() !== goodsId) _2.default.error('goods id error');
      discount = discountValid ? sku.discount : 0;
      filters.sku = skuId;
    } else if (goods.skus && goods.skus.length) {
      _2.default.error('Please select sku');
    }

    // $Flow
    let record = await _CartItem2.default.findOne(filters);

    if (!record) {
      record = new _CartItem2.default(filters);
      record.quantity = 1;
    } else {
      record.quantity += 1;
    }
    if (quantity) {
      record.quantity = quantity;
    }
    record.pic = sku && sku.pic ? sku.pic : goods.pic;
    record.title = goods.title;
    record.currency = goods.currency;
    record.price = sku ? sku.price : goods.price;
    record.discount = discount;
    record.skuDesc = sku ? sku.desc : '';
    await record.save();
    return record.data('list');
  }
}
exports.default = Create;