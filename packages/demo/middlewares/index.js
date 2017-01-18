export default function (router) {
  router.use(async function (ctx, next) {
    let start = Date.now();
    await next();
    console.log('Elapsed time %s ms.', Date.now() - start);
  });

  //404
  router.use(async function (ctx, next) {
    await next();
    if (ctx.status === 404 && !ctx.body) {
      await ctx.show('404');
    }
  });
}
