import * as _ from 'lodash';
import { Context } from 'alaska-http';
import { isIdEqual } from 'alaska-model/utils';
import Goods from 'alaska-goods/models/Goods';
import Order from 'alaska-order/models/Order';
import OrderGoods from 'alaska-order/models/OrderGoods';
import Comment from '../../../models/Comment';
import service from '../../..';

interface CommentData {
  orderGoods: string;
  content: string;
  pics?: string[];
}

export async function _comment(ctx: Context) {
  let body = ctx.state.body || ctx.request.body;
  if (_.isEmpty(body.goods) || !Array.isArray(body.goods)) {
    service.error('goods is required!');
  }
  let order: Order = ctx.state.record;
  if (!isIdEqual(ctx.user, order.user)) service.error(403); // 只允许评论自己的订单
  if (order.commented) service.error('Order already commented');
  let goods = await OrderGoods.find({ _id: { $in: order.goods } }).session(ctx.dbSession);
  let goodsMap = _.keyBy(goods, 'id');
  let commentMap: Map<string, Comment> = new Map();
  for (let item of body.goods) {
    let { content, pics, orderGoods } = item as CommentData;
    if (!content) service.error('goods[].content is required!');
    if (!orderGoods) service.error('goods[].orderGoods is required!');
    if (commentMap.has(orderGoods)) service.error('duplicated orderGoods!');
    if (!goodsMap.hasOwnProperty(orderGoods)) service.error('order goods not found!');
    let og = goodsMap[orderGoods];
    if (og.comment) service.error('order goods already commented!');
    let comment = new Comment({
      type: 'goods',
      user: ctx.user._id,
      order: order._id,
      orderGoods: og._id,
      goods: og.goods,
      sku: og.sku,
      skuDesc: og.skuDesc,
      content,
      pics,
    });
    og.comment = comment._id;
    commentMap.set(orderGoods, comment);
  }

  let results = [];
  for (let c of commentMap.values()) {
    await c.save({ session: ctx.dbSession });
    results.push(c.data());
  }

  for (let g of goods) {
    if (g.isModified('comment')) {
      await g.save({ session: ctx.dbSession });
      await Goods.findByIdAndUpdate(g.goods, {
        $inc: {
          commentCount: 1
        }
      }).session(ctx.dbSession);
    }
  }

  order.commented = true;
  await order.save({ session: ctx.dbSession });

  ctx.body = results;
}
