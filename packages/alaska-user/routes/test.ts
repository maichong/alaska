import * as Router from 'koa-router';
import { Context } from 'alaska-http';

export default function (router: Router) {
  router.get('/test', (ctx: Context) => {
    ctx.body = 'alaska-user';
  });
}
