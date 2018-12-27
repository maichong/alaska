import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Goods from 'alaska-goods/models/Goods';
import Inventory from '../models/Inventory';
import service, { InputParams, ParamsBody } from '..';
import { SkuService, Sku } from 'alaska-sku';

let skuService: SkuService;
service.resolveConfig().then(() => {
  skuService = service.main.allServices['alaska-sku'] as SkuService;
});

export async function doInput(body: ParamsBody): Promise<Inventory> {
  let record = new Inventory(body);
  if (!body.sku || !body.goods) service.error('goods or sku is required');

  let goods: Goods;
  let sku: Sku;
  if (body.sku && skuService) {
    sku = await skuService.models.Sku.findById(body.sku);
    if (!sku) service.error('Sku not found');
    goods = await Goods.findById(goods);
  }

  if (!goods) {
    goods = await Goods.findById(body.goods);
    if (!goods) service.error('Goods not found');
  }

  if (sku) {
    let newSku = await skuService.models.Sku.findByIdAndUpdate(
      sku._id,
      { $inc: { inventory: body.quantity } },
      // @ts-ignore
      { returnOriginal: false }
    );
    if (!newSku) throw new Error('Update sku inventory failed');
    record.inventory = newSku.inventory;
    let index = _.findIndex(goods.skus, ['key', sku.key]);
    await Goods.findByIdAndUpdate(goods._id, {
      $inc: { inventory: body.quantity },
      [`skus[${index}].inventory`]: newSku.inventory
    });
  } else {
    // 没有SKU，直接更新商品
    if (_.size(goods.skus)) service.error('goods sku is required');
    let newGoods = await Goods.findByIdAndUpdate(goods._id, {
      $inc: { inventory: body.quantity }
    });
    if (newGoods) {
      record.inventory = newGoods.inventory;
    } else {
      // 异常
      record.inventory = goods.inventory + body.quantity;
    }
  }

  await record.save();
  return record;
}

export default class Input extends Sled<InputParams, Inventory> {
  async exec(params: InputParams): Promise<Inventory> {
    if (this.result) return;
    let body = params.body;
    // @ts-ignore parse number
    body.quantity = parseInt(body.quantity);
    body.user = (params.admin || params.user)._id;
    if (!body.quantity || body.quantity < 1) service.error('Invalid quantity');
    return await doInput(body);
  }
}
