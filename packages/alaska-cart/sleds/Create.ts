import { Sled } from 'alaska-sled';
import Goods from 'alaska-goods/models/Goods';
import { SkuService, Sku } from 'alaska-sku';
import CartGoods from '../models/CartGoods';
import service, { CreateParams } from 'alaska-cart';

let skuService: SkuService;
service.resolveConfig().then(() => {
  skuService = service.main.allServices['alaska-sku'] as SkuService;
});

export default class Create extends Sled<CreateParams, CartGoods> {
  /**
   * 加入购物车
   * @param params
   *        params.user 用户记录
   *        params.goods 商品ID
   *        [params.sku] SKU ID
   *        [params.quantity] 数量
   */
  async exec(params: CreateParams): Promise<CartGoods> {
    let skuId = params.sku;
    let sku: Sku;
    let goods: Goods = await Goods.findById(params.goods);
    if (!goods) service.error('Goods not found');
    if (!skuId && goods.skus && goods.skus.length === 1) {
      skuId = goods.skus[0]._id;
    }
    if (params.sku && skuService) {
      sku = await skuService.models.Sku.findById(skuId).where({ goods: goods._id });
      if (!sku) service.error('Sku not found');
    }
    if (goods.skus && goods.skus.length && !sku) {
      service.error('Please select sku');
    }

    let discountValid = goods.discountValid;
    let discount = discountValid ? goods.discount : 0;
    let filters: Partial<CartGoods> = { user: params.user, goods: goods._id };

    if (sku) {
      discount = discountValid ? sku.discount : 0;
      filters.sku = skuId;
    }

    let record: CartGoods = await CartGoods.findOne(filters);

    if (!record) {
      record = new CartGoods(filters);
      record.quantity = 1;
    } else {
      record.quantity += 1;
    }
    if (params.quantity) {
      record.quantity = params.quantity;
    }
    record.pic = sku && sku.pic ? sku.pic : goods.pic;
    record.title = goods.title;
    record.currency = goods.currency;
    record.price = sku ? sku.price : goods.price;
    record.discount = discount;
    record.skuDesc = sku ? sku.desc : '';
    await record.save();
    return record;
  }
}
