import { Context } from 'alaska-http';
import { Model } from 'alaska-model';

export async function show(ctx: Context, next: Function) {
  await next();
  if (ctx.user && ctx.body && ctx.body.id) {
    let Favorite = Model.lookup('alaska-favorite.Favorite');
    if (Favorite) {
      ctx.body.favored = !!(await Favorite.findOne({ user: ctx.user._id, type: 'goods', goods: ctx.body.id }).select('goods'));
    }
  }
}
