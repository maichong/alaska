import { Context } from 'alaska-http';
import userService from 'alaska-user';
import service from '..';
import Complete from '../sleds/Complete';
import Create from '../sleds/Create';
import Payment from '../models/Payment';

export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body;

  if (!ctx.state.ignoreAuthorization) {
    let user = ctx.user || service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-payment.Payment.create')) service.error(403);
    body.user = user;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user) {
      body.user = ctx.user;
    }
  }

  let payment = await Create.run(body, { dbSession: ctx.dbSession });

  if (payment.state === 'success') {
    await Complete.run({ record: payment }, { dbSession: ctx.dbSession });
  }

  let data = payment.data('create');
  await userService.trimProtectedField(data, ctx.user, Payment, payment);
  ctx.body = data;
}
