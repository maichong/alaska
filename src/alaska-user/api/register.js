// @flow

import service from '../';

export default async function (ctx: Alaska$Context) {
  if (ctx.method !== 'POST') ctx.error(400);

  let { username, password } = ctx.request.body;

  if (!username) ctx.error('Username is required');

  if (!password) ctx.error('Password is required');

  let user = await service.run('Register', { username, password, ctx });
  ctx.body = user.data('info');
}
