import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import service from '..';
import Register from '../sleds/Register';

interface RegisterBody {
  username: string;
  password: string;
}

export default function (router: Router) {
  router.post('/register', async (ctx: Context) => {

    let { username, password } = ctx.request.body as RegisterBody;

    if (!username) service.error('Username is required');

    if (!password) service.error('Password is required');

    let user = await Register.run({ username, password, ctx });
    ctx.body = user.data('info');
  });
}
