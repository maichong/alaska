import * as _ from 'lodash';
import * as mongodb from 'mongodb';
import { Sled } from 'alaska-sled';
import Goods from 'alaska-goods/models/Goods';
import Inventory from '../models/Inventory';
import service, { CreateParams, ParamsBody } from '..';
import { SkuService, Sku } from 'alaska-sku';

let skuService: SkuService;
service.resolveConfig().then(() => {
  skuService = service.lookup('alaska-sku') as SkuService;
});

async function doInput(body: ParamsBody, session: mongodb.ClientSession): Promise<Inventory> {
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
    let newSku = await skuService.models.Sku.incInventory(sku._id, body.quantity);
    if (!newSku) throw new Error('Failed to update sku inventory');
    record.inventory = newSku.inventory;
  } else {
    // 没有SKU，直接更新商品
    if (_.size(goods.skus)) service.error('goods sku is required');
    let newGoods = await Goods.incInventory(goods._id, body.quantity);
    if (newGoods) {
      record.inventory = newGoods.inventory;
    } else {
      // 异常，没有找到商品
      service.error('Goods not found');
    }
  }

  await record.save({ session });
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
    return await doInput(body, this.dbSession);
  }
}
