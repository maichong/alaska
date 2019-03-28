
import * as _ from 'lodash';
import { SkuService } from 'alaska-sku';
import Goods from 'alaska-goods/models/Goods';
import OrderGoods from 'alaska-order/models/OrderGoods';
import orderService from 'alaska-order';

let skuService: SkuService;
orderService.resolveConfig().then(() => {
  skuService = orderService.lookup('alaska-sku') as SkuService;
});

export async function post() {
  // 增加商品销量
  let orders = this.result;
  for (let order of orders) {
    let items = await OrderGoods.find({ order: order._id }).session(this.dbSession);
    for (let item of items) {
      if (item.sku && skuService) {
        // 增加SKU销量
        await skuService.models.Sku.incVolume(item.sku, item.quantity, this.dbSession);
      } else if (item.goods) {
        // 增加商品库存
        await Goods.incVolume(item.goods, item.quantity, this.dbSession);
      }
    }
  }
}
