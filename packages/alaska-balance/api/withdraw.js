// @flow

import service from '../';

export default async function create(ctx: Alaska$Context) {
  let user = ctx.user || service.error(403);
  let body = ctx.state.body || ctx.request.body;
  body.user = user;
  let withdraw = await service.run('Withdraw', body);
  ctx.body = withdraw.data('create');
}
