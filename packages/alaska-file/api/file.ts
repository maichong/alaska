import { Context } from 'alaska-http';
import Create from '../sleds/Create';
import { UserService } from 'alaska-user';
import fileService from '..';

/**
 * @http-body {File} file
 * @http-body {string} [driver]
 */
export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body || {};

  if (!ctx.state.ignoreAuthorization) {
    let ability = 'alaska-file.File.create';
    const userService = fileService.lookup('alaska-user') as UserService;
    if (userService && !await userService.hasAbility(ctx.user, ability)) ctx.throw(ctx.user ? 403 : 401);
    body.user = ctx.user._id;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user && ctx.user) {
      body.user = ctx.user._id;
    }
  }

  let file = await Create.run({
    ctx,
    user: body.user,
    driver: body.driver,
  }, { dbSession: ctx.dbSession });

  ctx.body = file.data();
}
