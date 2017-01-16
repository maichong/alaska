// @flow

import type Router from 'koa-router';
import service from '../';

export default function (router: Router) {
  let superMode = service.config('superMode');
  if (typeof superMode === 'string') {
    superMode = {
      cookie: superMode
    };
  }
  router.use((ctx: Alaska$Context, next: Function) => {
    ctx.state.superMode = false;
    if (superMode === true) {
      ctx.state.superMode = true;
    } else if (superMode) {
      if (superMode.cookie && ctx.cookies.get(superMode.cookie)) {
        ctx.state.superMode = true;
      } else if (ctx.user) {
        if (superMode.userId && superMode.userId === ctx.user.id) {
          ctx.state.superMode = true;
        } else if (superMode.username && superMode.username === ctx.user.username) {
          ctx.state.superMode = true;
        }
      }
    }
    return next();
  });
}
