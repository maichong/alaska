import { Context } from 'alaska-http';
import userService from 'alaska-user';
import service from '..';
import Complete from '../sleds/Complete';
import Create from '../sleds/Create';
import Payment from '../models/Payment';

export async function create(ctx: Context) {
  let user = ctx.user || service.error(401);
  if (!userService.hasAbility(ctx.user, 'alaska-payment.Payment.create')) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  body.user = user;
  let payment = await Create.run(body);

  if (payment.state === 1) {
    await Complete.run({ payment });
  }

  let data = payment.data('create');
  await userService.trimProtectedField(data, ctx.user, Payment, payment);
  ctx.body = data;
}
