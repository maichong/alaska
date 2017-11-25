'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;
exports.post = post;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaskaBalance = require('alaska-balance');

var _alaskaBalance2 = _interopRequireDefault(_alaskaBalance);

var _Goods = require('alaska-goods/models/Goods');

var _Goods2 = _interopRequireDefault(_Goods);

var _Sku = require('alaska-goods/models/Sku');

var _Sku2 = _interopRequireDefault(_Sku);

var _alaskaOrder = require('alaska-order');

var _alaskaOrder2 = _interopRequireDefault(_alaskaOrder);

var _Order = require('alaska-order/models/Order');

var _Order2 = _interopRequireDefault(_Order);

var _OrderItem = require('alaska-order/models/OrderItem');

var _OrderItem2 = _interopRequireDefault(_OrderItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function pre() {
  const currenciesMap = _alaskaBalance2.default.currenciesMap;
  let params = this.params;
  let gids = params.goods;
  if (!gids || !gids.length) {
    return;
  }
  params.orders = params.orders || [];
  let orders = params.orders;
  let orderItems = [];
  for (let g of gids) {
    if (!g.id) continue;
    let goods = await _Goods2.default.findById(g.id);
    if (!goods) continue;
    if (!goods.activated) _alaskaOrder2.default.error('Goods is not activated');
    let discountValid = goods.discountValid;
    let item = new _OrderItem2.default({
      pic: goods.pic,
      goods: goods._id,
      title: goods.title,
      currency: goods.currency,
      price: goods.price,
      shipping: goods.shipping || 0,
      discount: discountValid ? goods.discount : 0,
      quantity: parseInt(g.quantity) || 1
    });
    let sku;
    //如果选择了SKU
    if (g.sku) {
      sku = await _Sku2.default.findById(g.sku).where('goods', goods._id);
      if (!sku || !sku.inventory) _alaskaOrder2.default.error('Goods have been sold out');
      item.price = sku.price;
      item.discount = discountValid ? sku.discount : 0;
      item.skuDesc = sku.desc;
      if (sku.pic) {
        item.pic = sku.pic;
      }
    } else if (goods.skus && goods.skus.length) {
      //如果没有选择SKU,但是商品却又有SKU设置
      _alaskaOrder2.default.error('Please select goods props');
    } else if (!goods.inventory) {
      //没有库存
      _alaskaOrder2.default.error('Goods have been sold out');
    } else {
      //没有指定SKU的商品
    }
    let currency = currenciesMap[goods.currency] || _alaskaBalance2.default.defaultCurrency;
    let precision = currency.precision || 0;

    item.total = _lodash2.default.round(item.quantity * (item.discount || item.price), precision);
    orderItems.push(item);
  }

  orderItems.forEach(item => {
    let order = _lodash2.default.find(orders, o => o.type === 'goods' && o.canAppendItem(item));
    if (order) {
      order.items.push(item);
    } else {
      order = new _Order2.default({
        title: item.title,
        type: 'goods',
        pic: item.pic,
        user: params.user._id,
        currency: item.currency
      });
      order.address = params.address;
      order.items = [item];
      orders.push(order);
    }
    // $Flow item.order确认既可以是order对象 也可以是order._id
    item.order = order._id;
  });

  //计算订单价格
  orders.forEach(order => {
    if (order.type !== 'goods') return;
    let shipping = 0;
    let total = 0;
    order.items.forEach(item => {
      if (item.shipping) {
        shipping += item.shipping;
      }
      total += item.total || 0;
    });
    order.shipping = shipping;
    order.total = total;
    order.pay = shipping + total;
  });
}

async function post() {
  let orders = this.params.orders;
  //TODO 减少商品库存
  // for (let order of orders) {
  // }
}