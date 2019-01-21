import { Context } from 'alaska-http';
import Create from '../sleds/Create';

export async function create(ctx: Context) {
  let user = ctx.user || this.service.error(403);
  let body = ctx.state.body || ctx.request.body;
  body.user = user;
  let withdraw = await Create.run(body, { dbSession: ctx.dbSession });
  ctx.body = withdraw.data('create');
}
