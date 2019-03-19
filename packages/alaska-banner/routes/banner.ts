import { Context, Router } from 'alaska-http';
import Banner from '../models/Banner';

export default function (router: Router) {
  router.get('/banner/redirect/:id', async (ctx: Context, next) => {
    let id = ctx.params.id;
    if (!/^[0-9a-f]{24}$/.test(id)) {
      await next();
      return;
    }
    let banner = await Banner.findById(id);
    if (!banner || !banner.isValid() || !banner.url) {
      await next();
      return;
    }
    await Banner.findByIdAndUpdate(banner._id, { $inc: { clicks: 1 } });
    ctx.redirect(banner.url);
  });
}
