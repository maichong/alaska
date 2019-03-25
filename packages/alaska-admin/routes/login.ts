import { Context, Router } from 'alaska-http';
import userService from 'alaska-user';
import Login from 'alaska-user/sleds/Login';
import Logout from 'alaska-user/sleds/Logout';
import service from '..';

export default function (router: Router) {
  router.post('/login', async (ctx: Context) => {
    ctx.state.adminApi = 'login';
    ctx.service = service;
    const body: any = ctx.request.body || {};
    let username = body.username || service.error('Username is required');
    let password = body.password || service.error('Password is required');
    let user = await Login.run({ ctx, username, password }, { dbSession: ctx.dbSession });
    let authorized = await userService.hasAbility(user, 'admin');
    ctx.body = Object.assign({ authorized }, user.data());
  });

  router.get('/logout', async (ctx) => {
    ctx.state.adminApi = 'logout';
    ctx.service = service;
    await Logout.run({ ctx }, { dbSession: ctx.dbSession });
    ctx.body = {};
  });
}
