/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-14
 * @author Liang <liang@maichong.it>
 */

import Banner from '../models/Banner';

export default function (router) {
  router.get('/redirect/:id', async function (ctx, next) {
    let id = ctx.params.id;
    if (!/^[0-9a-f]{24}$/.test(id)) {
      await next();
      return;
    }
    let banner = await Banner.findCache(id);
    if (!banner || !banner.isValid() || banner.action !== 'url' || !banner.url) {
      await next();
      return;
    }
    banner.clicks++;
    banner.save();
    ctx.redirect(banner.url);
  });
}
