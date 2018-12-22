import * as _ from 'lodash';
import { Context } from 'alaska-http';
import { GET, PATCH } from 'alaska-api';
import User from '../models/User';
import service from '..';

/**
 * 查看、修改用户信息
 * @http-body {object} {...user}
 */
GET(info);
PATCH(info);
export async function info(ctx: Context) {
  let user = ctx.user;
  if (!user) service.error(403);

  if (ctx.method === 'PATCH') {
    // 修改信息
    let body = ctx.state.body;
    if (!body) {
      // 权限检查
      body = _.assign({}, ctx.request.body);
      await service.trimDisabledField(body, user, User, user);
    }
    user.set(body);
    await user.save();
  }

  ctx.body = user.data('info');
}

/**
 * 绑定Tel，需要前置中间件中检查验证码
 * @http-body {string} tel
 */
async function bindTel(ctx: Context) {
  let user = ctx.user;
  if (!user) service.error(403);

  let { tel } = ctx.state.body || ctx.request.body;
  if (!tel) service.error('tel is required');

  user.tel = tel;
  await user.save();
  ctx.body = user.data('info');
}

exports['bind-tel'] = bindTel;

/**
 * 绑定Email，需要前置中间件中检查验证码
 * @http-body {string} email
 */
async function bindEmail(ctx: Context) {
  let user = ctx.user;
  if (!user) service.error(403);

  let { email } = ctx.state.body || ctx.request.body;
  if (!email) service.error('email is required');

  user.email = email;
  await user.save();
  ctx.body = user.data('info');
}

exports['bind-email'] = bindEmail;

/**
 * 修改密码
 * @http-body {string} password
 */
export async function passwd(ctx: Context) {
  if (!ctx.user) service.error(403);

  let body = ctx.state.body || ctx.request.body as { password: string };

  if (!body || !body.password) {
    service.error('New password is required');
  }

  ctx.user.password = body.password;
  await ctx.user.save();
  ctx.body = {};
}
