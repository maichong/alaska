import { Context } from 'alaska-http';
import Create from '../sleds/Create';

export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) ctx.throw(401);
    body.user = ctx.user;
    delete body.fields;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user) {
      body.user = ctx.user;
    }
  }

  let withdraw = await Create.run(body, { dbSession: ctx.dbSession });
  ctx.body = withdraw.data('create');
}
