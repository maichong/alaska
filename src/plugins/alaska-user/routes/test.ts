import * as Router from 'koa-router';

export default function (router: Router) {
  router.get('/test', async (ctx, next) => {
    ctx.body = 'alaska-user plugin';
  });
}
