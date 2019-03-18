import * as _ from 'lodash';
import { Context } from 'alaska-http';
import Goods from 'alaska-goods/models/Goods';
import CartGoods from 'alaska-cart/models/CartGoods';
import Shop from '../../../models/Shop';
import service from '../../..';

export async function list(ctx: Context) {
  if (!ctx.user) service.error(401);
  let goods = _.map(await CartGoods.find({ user: ctx.user._id }), (g) => g.data());

  const shopMap: Map<string, [Shop | null, any[]]> = new Map();
  const goodsMap: Map<string, Goods> = new Map();
  for (let data of goods) {
    let info = shopMap.get(data.shop || '');
    if (!info) {
      let shop;
      if (data.shop) {
        shop = await Shop.findById(data.shop);
      }
      info = [shop, [data]];
      shopMap.set(data.shop || '', info);
    } else {
      info[1].push(data);
    }

    let g = goodsMap.get(data.goods);
    if (!g) {
      g = await Goods.findById(data.goods);
      if (!g) continue;
      goodsMap.set(data.goods, g);
    }
    data.inventory = g.inventory;
    if (data.sku) {
      let sku = _.find(g.skus, (s) => String(s.id) === String(data.sku));
      if (sku) {
        data.inventory = sku.inventory;
      }
    }
  }
  let body = [];
  for (let info of shopMap.values()) {
    let shop = info[0] ? info[0].data() : { id: '', title: '' };
    shop.goods = info[1];
    body.push(shop);
  }
  ctx.body = body;
}
