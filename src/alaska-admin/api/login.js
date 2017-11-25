// @flow

import USER from 'alaska-user';

export async function login(ctx: Alaska$Context) {
  let username = ctx.request.body.username || ctx.error('Username is required');
  let password = ctx.request.body.password || ctx.error('Password is required');
  let user = await USER.run('Login', { ctx, username, password });
  let access = await user.hasAbility('admin');
  ctx.body = Object.assign({ access }, user.data());
}

export async function logout(ctx: Alaska$Context) {
  await USER.run('Logout', { ctx });
  ctx.body = {};
}
