// @flow

import service from '../';

export async function create(ctx: Alaska$Context, next: Function) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let target = body.target || service.error('missing favorite target');
  let type = body.type || service.error('missing favorite type');
  type = type || '';
  let { title, pic } = body;
  if (!pic || !title) {
    let Model = service.getModel(type);
    // $Flow findById
    let record: Alaska$Model<*> = await Model.findById(target);
    if (!record) service.error('missing favorite target record');
    let titleField: string = Model.titleField || '';
    body.title = body.title || record.get(titleField);
    // $Flow avatar 只有user中有 Alaska$Model中不要加avatar
    body.pic = body.pic || record.pic || record.avatar;
  }
  await next();
}
