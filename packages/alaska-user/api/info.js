// @flow

import service from '../';

//用户信息
export default async function (ctx: Alaska$Context) {
  if (!ctx.user) {
    service.error(403);
  } else {
    // 已登录
    ctx.body = ctx.user.data('info');
  }
}

//修改密码
export async function chpass(ctx: Alaska$Context) {
  if (ctx.method !== 'POST') {
    service.error(400);
  }

  if (!ctx.user) {
    service.error(403);
  } else {
    // 已登录
    let password = ctx.request.body.password;

    if (!password) {
      service.error('New password is required');
    }

    ctx.user.password = password;
    await ctx.user.save();
    ctx.body = {};
  }
}
