import { Context } from 'alaska-http';
import userService from 'alaska-user';
import Favorite from '../models/Favorite';
import Create from '../sleds/Create';
import service from '..';

export async function create(ctx: Context) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let record = await Create.run(Object.assign({}, body, { user: ctx.user._id }), { dbSession: ctx.dbSession });
  let data = record.data();
  userService.trimProtectedField(data, ctx.user, Favorite, record);
  ctx.body = data;
}
