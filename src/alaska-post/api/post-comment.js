// @flow

import service from '../';

//获取文章或者专题评论
export async function list(ctx: Alaska$Context, next: Function) {
  let post = ctx.state.post || ctx.query.post;
  let topic = ctx.state.topic || ctx.query.topic;
  if (!post && !topic) service.error(400);
  let filters: any = ctx.state.filters || ctx.query.filters || {};
  if (post) {
    filters.post = post;
  } else if (topic) {
    filters.topic = topic;
  }

  ctx.state.filters = filters;
  await next();

  // $Flow 访问body
  let results = ctx.body.results;
  if (results) {
    // $Flow results一定有
    ctx.body.results = results.map((p) => {
      if (p.user) {
        p.user = p.user.pick('id', 'username', 'avatar');
      }
      return p;
    });
  }
}
