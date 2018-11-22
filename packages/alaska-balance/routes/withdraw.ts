import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import Withdraw from '../sleds/Withdraw';

export default function (router: Router) {
  /**
   * 创建
   */
  router.post('/withdrow', async (ctx: Context) => {
    let user = ctx.user || this.service.error(403);
    let body = ctx.state.body || ctx.request.body;
    body.user = user;
    let withdraw = await Withdraw.run(body);
    ctx.body = withdraw.data('create');
  });
}
