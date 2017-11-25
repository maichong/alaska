// @flow

import service from '../';

export default async function create(ctx: Alaska$Context) {
  let user = ctx.user || service.error(403);
  let body = ctx.state.body || ctx.request.body;
  body.user = user;
  let payment = await service.run('Create', body);

  if (payment.state === 1) {
    await service.run('Complete', { payment });
  }

  ctx.body = payment.data('create');
}
