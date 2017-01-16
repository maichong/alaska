// @flow

import alaska from 'alaska';

export default async function (ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query.service;
  let modelName = ctx.state.model || ctx.query.model;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }

  let s = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.model(modelName);

  let ability = `admin.${Model.key}.`;
  if (id) {
    ability += 'update';
  } else {
    ability += 'create';
  }
  await ctx.checkAbility(ability);

  let record: ?Alaska$Model = null;
  if (id) {
    // $Flow
    let doc: Alaska$Model = await Model.findById(id);
    if (!doc) {
      alaska.error('Record not found');
    }
    record = doc;
  } else {
    record = new Model();
  }
  record.set(body);

  await record.save();

  ctx.body = record;
}
