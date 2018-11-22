import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';

export default function (router: Router) {
  router.post('/logout', async (ctx: Context) => {

    await service.run('Logout', { ctx });
    ctx.body = {};
  });
}
