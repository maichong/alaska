import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';

export default function (router: Router) {
  router.get('/chpass', async (ctx: Context) => {
    if (ctx.method !== 'POST') {
      service.error(400);
    }

    if (!ctx.user) {
      service.error(403);
    } else {
      // 已登录
      let body = ctx.request.body as { password: string};

      if (!body || !body.password) {
        service.error('New password is required');
      }

      ctx.user.password = body.password;
      await ctx.user.save();
      ctx.body = {};
    }
  });
}
