import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';

interface LoginBody {
  username: string;
  password: string;
}

export default function (router: Router) {
  router.post('/login', async (ctx: Context) => {

    let { username, password } = ctx.request.body as LoginBody;

    if (!username) service.error('Username is required');

    if (!password) service.error('Password is required');

    let user = await service.run('Login', { ctx, username, password });

    ctx.body = user.data('info');
  });
}
