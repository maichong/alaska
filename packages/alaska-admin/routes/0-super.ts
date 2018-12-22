import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import { } from 'alaska-admin';
import service from '..';

export default function (router: Router) {
  let config = service.config.get('superMode');

  router.all('(.*)', (ctx: Context, next: Function) => {
    ctx.service = service;
    ctx.state.jsonApi = true;
    if (config) {
      ctx.state.superModel = setSuperMode(ctx);
    }
    return next();
  });

  function has(array: string | string[], value: string): boolean {
    return Array.isArray(array) ? array.indexOf(value) > -1 : array === value;
  }

  function setSuperMode(ctx: Context): boolean {
    let superMode = ctx.state.superMode;
    if (superMode) return true;
    if (config.cookie && ctx.cookies.get('config')) return true;
    if (ctx.user) {
      if (config.userId && has(config.userId, ctx.user.id)) return true;
      if (config.username && has(config.username, ctx.user.username)) return true;
      if (config.email && has(config.email, ctx.user.email)) return true;
    }
    return false;
  }
}
