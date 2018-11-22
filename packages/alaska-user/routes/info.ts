import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';

export default function (router: Router) {
  router.get('/user', (ctx: Context) => {
    if (!ctx.user) {
      service.error(403);
    } else {
      // 已登录
      ctx.body = ctx.user.data('info');
    }
  });
}
