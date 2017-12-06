// @flow

import alaska from 'alaska';

export default async function list(ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let id = ctx.state.id || decodeURIComponent(ctx.query._id);
  if (!serviceId || !modelName || !id) {
    alaska.error('Invalid parameters');
  }
  if (!alaska.hasService(serviceId)) {
    alaska.error('Invalid parameters');
  }
  let s = alaska.getService(serviceId);
  let Model = s.getModel(modelName);
  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let record = await Model.findById(id);
  if (!record) {
    alaska.error('Record not found');
  }
  ctx.body = record;
}
