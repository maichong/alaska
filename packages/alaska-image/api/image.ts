import { Context } from 'alaska-http';
import Create from '../sleds/Create';
import { UserService } from 'alaska-user';
import imageService from '..';

/**
 * @http-body {File} file
 * @http-body {string} [driver]
 */
export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body || {};

  if (!ctx.state.ignoreAuthorization) {
    let ability = 'alaska-image.Image.create';
    const userService = imageService.main.allServices.get('alaska-user') as UserService;
    if (userService && !await userService.hasAbility(ctx.user, ability)) ctx.throw(ctx.user ? 403 : 401);
    body.user = ctx.user._id;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user && ctx.user) {
      body.user = ctx.user._id;
    }
  }

  let image = await Create.run({
    ctx,
    user: body.user,
    driver: body.driver,
  }, { dbSession: this.dbSession });

  ctx.body = image.data();
}
