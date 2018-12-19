import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import Logout from '../sleds/Logout';

export default function (router: Router) {
  router.post('/logout', async (ctx: Context) => {

    await Logout.run({ ctx });
    ctx.body = {};
  });
}
