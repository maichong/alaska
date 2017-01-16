// @flow

import service from '../';

export default async function (ctx: Alaska$Context) {
  if (ctx.method !== 'POST') {
    service.error(400);
  }

  let username = ctx.request.body.username;
  let password = ctx.request.body.password;

  if (!username) {
    service.error('Username is required');
  }

  if (!password) {
    service.error('Password is required');
  }

  let user = await service.run('Register', { username, password, ctx });
  ctx.body = user.data('info');
}
