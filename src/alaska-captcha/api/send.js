// @flow

import service from '../';

export default async function (ctx:Alaska$Context) {
  if (ctx.method !== 'POST') service.error(400);
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  let to = body.to || ctx.request.body.to;
  await service.run('Send', { ctx, id, to });
  ctx.body = {};
}
