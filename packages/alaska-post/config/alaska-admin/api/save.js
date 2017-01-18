// @flow

export default async function (ctx: Alaska$Context, next: Function) {
  let serviceId = ctx.state.service || ctx.query.service;
  let modelName = ctx.state.model || ctx.query.model;
  if (ctx.user && serviceId === 'alaska-post' && modelName === 'Post') {
    let body = ctx.state.body || ctx.request.body;
    if (!body.user) {
      body.user = ctx.user._id;
    }
    ctx.state.body = body;
  }
  await next();
}
