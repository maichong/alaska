import * as _ from 'lodash';
import { Context } from 'alaska-http';
import Register from '../sleds/Register';

interface RegisterBody {
  username: string;
  password: string;
}

export async function login(ctx: Context) {
  let body: RegisterBody = ctx.state.body || _.pick(ctx.request.body, 'username', 'password');

  if (!body.username) ctx.throw(400, 'Username is required');
  if (!body.password) ctx.throw(400, 'Password is required');

  let user = await Register.run(_.assign({ ctx }, body));
  ctx.body = user.data('info');
}
