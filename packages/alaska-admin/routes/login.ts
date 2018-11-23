import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import USER from 'alaska-user';
import Login from 'alaska-user/sleds/Login';
import Logout from 'alaska-user/sleds/Logout';
import service from '..';

export default function (router: Router) {
  router.post('/login', async (ctx: Context) => {
    const body: any = ctx.request.body || {};
    let username = body.username || service.error('Username is required');
    let password = body.password || service.error('Password is required');
    let user = await Login.run({ ctx, username, password });
    let authorized = await USER.hasAbility(user, 'admin');
    ctx.body = Object.assign({ authorized }, user.data());
  });

  router.get('/logout', async (ctx) => {
    await Logout.run({ ctx });
    ctx.body = {};
  });
}