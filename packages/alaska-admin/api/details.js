// @flow

import alaska from 'alaska';

export default async function list(ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let id = ctx.state.id || ctx.query._id;
  if (!serviceId || !modelName || !id) {
    alaska.error('Invalid parameters');
  }
  let s = alaska.service(serviceId, true);
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model = s.model(modelName);
  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let record = await Model.findById(id);
  if (!record) {
    alaska.error('Record not found');
  }
  ctx.body = record;
}
