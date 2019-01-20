import * as _ from 'lodash';
import balanceService from 'alaska-balance';
import Goods from 'alaska-goods/models/Goods';
import { SkuService, Sku } from 'alaska-sku';
import orderService, { CreateParams } from 'alaska-order';
import Order from 'alaska-order/models/Order';
import OrderGoods from 'alaska-order/models/OrderGoods';
import { CartService } from 'alaska-cart';

interface GoodsParams {
  goods: string;
  sku?: string;
  quantity?: number;
}

interface Params extends CreateParams {
  goods: GoodsParams[];
}

let skuService: SkuService;
orderService.resolveConfig().then(() => {
  skuService = orderService.main.allServices['alaska-sku'] as SkuService;
});

let cartService: CartService;
orderService.resolveConfig().then(() => {
  cartService = orderService.main.allServices['alaska-cart'] as CartService;
});

export async function pre() {
  const currenciesMap = balanceService.currenciesMap;
  let params: Params = this.params;
  let gids = params.goods;
  if (!gids || !gids.length) {
    return;
  }
  params.records = params.records || [];
  let orders: Order[] = params.records;

  // 生成 OrderGoods 列表
  let orderItems: OrderGoods[] = [];

  for (let g of gids) {
    if (!g.goods) continue;
    let goods: Goods = await Goods.findById(g.goods).session(this.dbSession);
    if (!goods) orderService.error('Goods not found');
    if (!goods.activated) orderService.error('Goods is not activated');

    let discountValid = goods.discountValid;
    let item = new OrderGoods({
      pic: goods.pic,
      goods: goods._id,
      title: goods.title,
      currency: goods.currency,
      price: goods.price,
      shipping: goods.shipping || 0,
      discount: discountValid ? goods.discount : 0,
      // @ts-ignore parseInt number
      quantity: parseInt(g.quantity) || 1
    });

    let sku: Sku;
    if (g.sku) {
      // 如果选择了SKU
      sku = await skuService.models.Sku.findById(g.sku).where('goods', goods._id).session(this.dbSession);
      if (!sku || !sku.inventory) orderService.error('Goods have been sold out');
      if (!_.find(goods.skus, (s) => s.key === sku.key)) orderService.error('Goods have been sold out');
      item.price = sku.price;
      item.discount = discountValid ? sku.discount : 0;
      item.sku = sku._id;
      item.skuKey = sku.key;
      item.skuDesc = sku.desc;
      if (sku.pic) {
        item.pic = sku.pic;
      }
      // SKU 库存不足
      if (item.quantity > sku.inventory) orderService.error('Inventory shortage');
    } else if (goods.skus && goods.skus.length) {
      // 如果没有选择SKU,但是商品却又有SKU设置
      orderService.error('Please select goods props');
    } else if (!goods.inventory) {
      // 没有库存
      orderService.error('Goods have been sold out');
    } else {
      // 没有指定SKU的商品
    }
    // 商品库存不足
    if (!sku && item.quantity > goods.inventory) orderService.error('Inventory shortage');
    let currency = currenciesMap[goods.currency] || balanceService.defaultCurrency;
    let precision = currency.precision || 0;

    item.total = _.round(item.quantity * (item.discount || item.price), precision);
    orderItems.push(item);
  }

  // 将 OrderGoods 放置到不同的订单中
  _.forEach(orderItems, (item: OrderGoods) => {
    let order: Order = _.find(orders, (o: Order) => o.type === 'goods' && o.canAppendGoods(item));
    if (order) {
      item.order = order._id;
      order.goods.push(item);
    } else {
      order = new Order({
        title: item.title,
        type: 'goods',
        pic: item.pic,
        user: params.user._id,
        currency: item.currency,
        state: 200
      });
      item.order = order._id;
      order.address = params.address;
      order.goods = [item];
      orders.push(order);
    }
  });

  //计算订单价格
  _.forEach(orders, (order: Order) => {
    if (order.type !== 'goods') return;
    let shipping = 0;
    let total = 0;
    // @ts-ignore
    _.forEach(order.goods, (item: OrderGoods) => {
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
  let { goods, user, records } = this.params;
  if (this.params.pre) return; // 预下单，不影响库存
  if (_.isEmpty(goods)) return; // 不是商品订单

  // 创建订单后，删除购物车内的对应商品
  if (cartService && user) {
    const CartGoods = cartService.models.CartGoods;
    for (let g of goods) {
      let conditions: any = { user, goods: g.goods };
      if (g.sku) {
        conditions.sku = g.sku;
      }
      await CartGoods.remove(conditions).session(this.dbSession);
    }
  }

  // 减少商品库存
  let orders = this.result;
  for (let order of (orders || records)) {
    let items = await OrderGoods.find({ order: order._id }).session(this.dbSession);
    for (let item of items) {
      if (item.sku && skuService) {
        // 减少SKU 库存
        await skuService.models.Sku.incInventory(item.sku, -item.quantity, this.dbSession);
      } else if (item.goods) {
        // 减小商品库存
        await Goods.incInventory(item.goods, -item.quantity, this.dbSession);
      }
    }
  }
}
