import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Goods from 'alaska-goods/models/Goods';
import Inventory from '../models/Inventory';
import service, { CreateParams, ParamsBody } from '..';
import { SkuService, Sku } from 'alaska-sku';

let skuService: SkuService;
service.resolveConfig().then(() => {
  skuService = service.main.allServices['alaska-sku'] as SkuService;
});

export async function doInput(body: ParamsBody): Promise<Inventory> {
  let record = new Inventory({
    user: body.user,
    type: body.type,
    desc: body.desc,
    goods: body.goods,
    sku: body.sku,
    quantity: body.quantity,
  });
  if (!body.sku && !body.goods) service.error('goods or sku is required');

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

  if (skuService && !sku && _.size(goods.skus) === 1) {
    // 如果goods 只有一条sku数据，允许 sku 参数可选
    sku = await skuService.models.Sku.findById(goods.skus[0]._id);
  }

  if (sku) {
    let newSku = await skuService.models.Sku.findOneAndUpdate(
      { _id: sku._id },
      { $inc: { inventory: body.quantity } },
      { new: true }
    );
    if (!newSku) throw new Error('Update sku inventory failed');
    record.inventory = newSku.inventory;
    let index = _.findIndex(goods.skus, ['key', sku.key]);
    await Goods.findByIdAndUpdate(goods._id, {
      $inc: { inventory: body.quantity },
      $set: {
        [`skus.${index}.inventory`]: newSku.inventory
      },
    });
  } else {
    // 没有SKU，直接更新商品
    if (_.size(goods.skus)) service.error('goods sku is required');
    let newGoods = await Goods.findOneAndUpdate(
      { _id: goods._id },
      { $inc: { inventory: body.quantity } },
      { new: true }
    );
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

export default class Create extends Sled<CreateParams, Inventory> {
  async exec(params: CreateParams): Promise<Inventory> {
    if (this.result) return;
    let body = params.body;
    // @ts-ignore parse number
    body.quantity = parseInt(body.quantity);
    body.user = (params.admin || params.user)._id;
    if (!body.quantity || body.quantity < 1) service.error('Invalid quantity');
    if (body.type === 'output') {
      body.quantity = -body.quantity;
    } else {
      body.type = 'input';
    }
    return await doInput(body);
  }
}
