import { Context } from 'alaska-http';
import { GET } from 'alaska-api';
import service from '..';

GET(info);
export function info(ctx: Context) {
  let user = ctx.user;
  if (!user) service.error(403);

  ctx.body = user.data('info');
}
