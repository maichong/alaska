import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';
import Login from '../sleds/Login';

interface LoginBody {
  username: string;
  password: string;
}

export default function (router: Router) {
  router.post('/login', async (ctx: Context) => {

    let { username, password } = ctx.request.body as LoginBody;

    if (!username) service.error('Username is required');

    if (!password) service.error('Password is required');

    let user = await Login.run({ ctx, username, password });

    ctx.body = user.data('info');
  });
}
