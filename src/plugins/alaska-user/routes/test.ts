import { Router } from 'alaska-http';

export default function (router: Router) {
  router.get('/test', async (ctx, next) => {
    ctx.body = 'alaska-user plugin';
  });
}
