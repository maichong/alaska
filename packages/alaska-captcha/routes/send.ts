import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import Send from '../sleds/Send';

interface SendBody {
  id: string;
  to: string;
}

export default function (router: Router) {
  router.post('/send', async (ctx: Context) => {
    let requestBody = ctx.request.body as SendBody;
    let body = ctx.state.body || requestBody;
    let id = body.id || requestBody.id;
    let to = body.to || requestBody.to;
    await Send.run({ ctx, id, to });
    ctx.body = {};
  });
}
