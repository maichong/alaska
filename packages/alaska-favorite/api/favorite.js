// @flow

import service from '../';

export async function create(ctx:Alaska$Context, next:Function) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let target = body.target || service.error('missing favorite target');
  let type = body.type || service.error('missing favorite type');
  type = type || '';
  let title = body.title;
  let pic = body.pic;
  if (!pic || !title) {
    let Model = service.model(type);
    // $Flow findById
    let record:Alaska$Model = await Model.findById(target);
    if (!record) service.error('missing favorite target record');
    let modelTitle:string = Model.title || '';
    body.title = body.title || record.get(modelTitle);
    body.pic = body.pic || record.pic || record.avatar;
  }
  await next();
}
