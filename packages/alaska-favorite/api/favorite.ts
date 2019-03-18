import { Context, GET } from 'alaska-http';
import { Model } from 'alaska-model';
import Create from '../sleds/Create';
import service from '../';


export async function create(ctx: Context, next: Function) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  //TODO: 只针对商品收藏 再优化吧
  ctx.body = await Create.run({
    user: ctx.user,
    type: body.type || 'alaska-goods.Goods',
    goods: body.goods,
    path: body.path || 'goods'
  });
}
