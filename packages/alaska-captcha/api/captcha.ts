import { Context } from 'alaska-http';
import Send from '../sleds/Send';

export async function send(ctx: Context) {
  let id = ctx.request.body.id || ctx.throw(400, 'id is required');
  let to = ctx.request.body.to || ctx.throw(400, 'to is required');

  await Send.run({ ctx, id, to });
  ctx.body = {};
}
