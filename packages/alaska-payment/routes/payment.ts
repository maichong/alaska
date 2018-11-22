import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';
import Complete from '../sleds/Complete';
import Create from '../sleds/Create';

export default function (router: Router) {
  /**
   * 创建记录
   */
  router.post('/payment', async (ctx: Context) => {
    let user = ctx.user || service.error(403);
    let body = ctx.state.body || ctx.request.body;
    body.user = user;
    let payment = await Create.run(body);

    if (payment.state === 1) {
      await Complete.run({ payment });
    }

    ctx.body = payment.data('create');
  });
}
