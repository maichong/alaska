import * as _ from 'lodash';
import { Context, GET, POST } from 'alaska-http';
import Login from '../sleds/Login';
import Logout from '../sleds/Logout';

interface LoginBody {
  username: string;
  password: string;
  channel?: string;
  remember?: boolean;
}

export default async function login(ctx: Context) {
  let body: LoginBody = ctx.state.body || _.pick(ctx.request.body, 'username', 'password', 'channel', 'remember');

  if (!body.username) ctx.throw(400, 'Username is required');
  if (!body.password) ctx.throw(400, 'Password is required');

  let user = await Login.run(_.assign({ ctx }, body));

  ctx.body = user.data('info');
}

GET(logout);
POST(logout);
export async function logout(ctx: Context) {
  await Logout.run({ ctx });
  ctx.body = {};
}
