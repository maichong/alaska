import { Context } from 'alaska-http';
import { Model } from 'alaska-model';

export async function show(ctx: Context, next: Function) {
  await next();
  if (ctx.user && ctx.body && ctx.body.id) {
    let Favorite = Model.lookup('alaska-favorite.Favorite');
    if (Favorite) {
      ctx.body.favorite = (await Favorite.findOne({ user: ctx.user._id, type: 'shop', shop: ctx.body.id }).select('_id') || { id: '' }).id;
    }
  }
}