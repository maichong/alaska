export default async function (ctx: Alaska$Context) {
  if (!ctx.path.endsWith('/') && ctx.path.lastIndexOf('/') < 1) {
    ctx.redirect(ctx.path + '/');
    return;
  }
  await ctx.show('index', {
    prefix: ctx.service.getConfig('prefix'),
    env: process.env.NODE_ENV || 'production'
  });
}
