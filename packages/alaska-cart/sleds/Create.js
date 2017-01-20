// @flow

import { Sled } from 'alaska';
import Goods from 'alaska-goods/models/Goods';
import Sku from 'alaska-goods/models/Sku';
import service from '../';
import CartItem from '../models/CartItem';

export default class Create extends Sled {

  /**
   * 加入购物车
   * @param params
   *        params.user 用户记录
   *        params.goodsId 商品ID
   *        [params.skuId] SKU ID
   *        [params.quantity] 数量
   */
  async exec(params: {
    user:User;
    goodsId:string;
    skuId?:string;
    quantity?:number;
  }): Promise<Object> {
    let { user, goodsId, skuId, quantity } = params;
    let sku: ?Sku;
    let goods: ?Goods;

    let goodsTmp: Goods = await Goods.findById(goodsId);

    goods = goodsTmp;

    if (!goods) service.error('goods is not found');
    let discountValid = goods.discountValid;
    let discount = discountValid ? goods.discount : 0;
    let filters = { user: user._id, goods: goodsId, sku: '' };
    if (skuId) {
      let skuTmp: Sku = await Sku.findById(params.skuId);

      sku = skuTmp;
      if (!sku) service.error('Can not find sku');
      if (sku.goods.toString() !== goodsId) service.error('goods id error');
      discount = discountValid ? sku.discount : 0;
      filters.sku = skuId;
    } else if (goods.skus && goods.skus.length) {
      service.error('Please select sku');
    }

    // $Flow
    let record: CartItem = await CartItem.findOne(filters);

    if (!record) {
      record = new CartItem(filters);
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
