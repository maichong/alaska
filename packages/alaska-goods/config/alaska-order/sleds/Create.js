// @flow

import _ from 'lodash';
import BALANCE from 'alaska-balance';
import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';
import ORDER from 'alaska-order';
import Order from 'alaska-order/models/Order';
import OrderItem from 'alaska-order/models/OrderItem';

const currenciesMap = BALANCE.currenciesMap;

export async function pre() {
  let data = this.data;
  let gids = data.goods;
  if (!gids || !gids.length) {
    return;
  }
  let orders = data.orders = data.orders || [];
  let orderItems = [];
  for (let g of gids) {
    if (!g.id) continue;
    // $Flow
    let goods:?Goods = await Goods.findById(g.id);
    if (!goods) continue;
    if (!goods.activated) ORDER.error('Goods is not activated');
    let discountValid = goods.discountValid;
    let item = new OrderItem({
      pic: goods.pic,
      goods: goods._id,
      title: goods.title,
      currency: goods.currency,
      price: goods.price,
      shipping: goods.shipping || 0,
      discount: discountValid ? goods.discount : 0,
      quantity: parseInt(g.quantity) || 1
    });
    let sku:Sku;
    //如果选择了SKU
    if (g.sku) {
      // $Flow
      sku = await Sku.findById(g.sku).where('goods', goods._id);
      if (!sku || !sku.inventory) ORDER.error('Goods have been sold out');
      item.price = sku.price;
      item.discount = discountValid ? sku.discount : 0;
      item.skuDesc = sku.desc;
      if (sku.pic) {
        item.pic = sku.pic;
      }
    } else if (goods.skus && goods.skus.length) { //如果没有选择SKU,但是商品却又有SKU设置
      ORDER.error('Please select goods props');
    } else if (!goods.inventory) { //没有库存
      ORDER.error('Goods have been sold out');
    } else {
      //没有指定SKU的商品
    }
    let currency = currenciesMap[goods.currency] || BALANCE.defaultCurrency;
    let precision = currency.precision || 0;

    item.total = _.round(item.quantity * (item.discount || item.price), precision);
    orderItems.push(item);
  }

  orderItems.forEach((item) => {
    let order = _.find(orders, (o) => o.type === 'goods' && o.canAppendItem(item));
    if (order) {
      order.items.push(item);
    } else {
      order = new Order({
        title: item.title,
        type: 'goods',
        pic: item.pic,
        user: data.user._id,
        currency: item.currency
      });
      order.address = data.address;
      order.items = [item];
      orders.push(order);
    }
    // $Flow item.order确认既可以是order对象 也可以是order._id
    item.order = order._id;
  });

  //计算订单价格
  orders.forEach((order) => {
    if (order.type !== 'goods') return;
    let shipping = 0;
    let total = 0;
    order.items.forEach((item) => {
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

export async function post() {
  let orders = this.data.orders;
  for (let order of orders) {
    //TODO 减少商品库存
  }
}
