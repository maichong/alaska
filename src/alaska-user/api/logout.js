// @flow

import service from '../';

export default async function (ctx: Alaska$Context) {
  await service.run('Logout', { ctx });
  ctx.body = {};
}
