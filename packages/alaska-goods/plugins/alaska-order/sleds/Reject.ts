
import * as _ from 'lodash';
import { SkuService } from 'alaska-sku';
import Goods from 'alaska-goods/models/Goods';
import OrderGoods from 'alaska-order/models/OrderGoods';
import orderService from 'alaska-order';

let skuService: SkuService;
orderService.resolveConfig().then(() => {
  skuService = orderService.main.allServices.get('alaska-sku') as SkuService;
});

export async function post() {
  // 商家拒绝订单后，减小销量，恢复库存
  let orders = this.result;
  for (let order of orders) {
    let items = await OrderGoods.find({ order: order._id }).session(this.dbSession);
    for (let item of items) {
      if (item.sku && skuService) {
        // 减小SKU销量
        await skuService.models.Sku.incVolume(item.sku, -item.quantity, this.dbSession);
        // 恢复SKU库存
        await skuService.models.Sku.incInventory(item.sku, item.quantity, this.dbSession);
      } else if (item.goods) {
        // 减小商品销量
        await Goods.incVolume(item.goods, -item.quantity, this.dbSession);
        // 恢复商品库存
        await Goods.incInventory(item.goods, item.quantity, this.dbSession);
      }
    }
  }
}
