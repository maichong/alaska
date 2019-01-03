import { Context } from 'alaska-http';
import Create from '../sleds/Create';
import { UserService } from 'alaska-user';
import imageService from '..';

/**
 * @http-body {File} file
 * @http-body {string} [driver]
 */
export async function create(ctx: Context) {
  let ability = 'alaska-image.Image.create';
  const userService = imageService.main.allServices['alaska-user'] as UserService;
  if (userService && !await userService.hasAbility(ctx.user, ability)) ctx.throw(ctx.user ? 403 : 401);

  let body = ctx.state.body || ctx.request.body || {};

  let image = await Create.run({
    ctx,
    user: ctx.user,
    driver: body.driver,
  });

  ctx.body = image.data();
}
