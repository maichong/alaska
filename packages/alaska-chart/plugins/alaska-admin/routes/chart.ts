import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import adminService from 'alaska-admin';

export default function (router: Router) {
  router.get('/chart/:id', async (ctx: Context) => {
    ctx.body = {
      id: ctx.params.id
    };
  });
}
