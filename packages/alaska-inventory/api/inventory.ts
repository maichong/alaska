import { Context } from 'alaska-http';
import userService from 'alaska-user';
import Create from '../sleds/Create';

export async function create(ctx: Context) {
  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) ctx.throw(401);
    let ability = 'alaska-inventory.Inventory.create';
    if (!await userService.hasAbility(ctx.user, ability)) ctx.throw(403);
  }

  let body = ctx.state.body || ctx.request.body;
  await Create.run({
    user: ctx.user,
    body
  }, { dbSession: ctx.dbSession });
}
