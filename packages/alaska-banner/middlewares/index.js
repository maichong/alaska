import Banner from '../models/Banner';

export default function (router) {
  router.get('/redirect/:id', async function (ctx, next) {
    let id = ctx.params.id;
    if (!/^[0-9a-f]{24}$/.test(id)) {
      await next();
      return;
    }
    let banner = await Banner.findById(id);
    if (!banner || !banner.isValid() || banner.action !== 'url' || !banner.url) {
      await next();
      return;
    }
    banner.clicks += 1;
    banner.save();
    ctx.redirect(banner.url);
  });
}
