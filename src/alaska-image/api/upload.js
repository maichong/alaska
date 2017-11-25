// @flow

import service from '../';
import Upload from '../sleds/Upload';

export default async function (ctx:Alaska$Context) {
  if (ctx.method !== 'POST') service.error(400);
  let auth = service.getConfig('auth');
  if (auth && !ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let file;
  if (ctx.files) {
    file = ctx.files.file;
  }

  let image = await Upload.run({
    user: ctx.user,
    file,
    ...body
  });

  ctx.body = image.pic;
}
