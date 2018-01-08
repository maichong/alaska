// @flow

import alaska from 'alaska';
import _ from 'lodash';

export default async function remove(ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  let records = body.records || ctx.request.body.records;

  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }

  let s: Alaska$Service = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.getModel(modelName);

  let ability = `admin.${Model.key}.remove`;
  if (Model.actions && Model.actions.remove && Model.actions.remove.ability) {
    ability = Model.actions.remove.ability;
  }
  await ctx.checkAbility(ability);

  if (id) {
    let record = await Model.findById(id);
    if (!record) {
      alaska.error('Record not found');
    }

    await record.remove();
  } else if (records) {
    for (let value of _.values(records)) {
      let record = await Model.findById(value);
      if (record) {
        await record.remove();
      }
    }
  } else {
    alaska.error('id not found');
  }

  ctx.body = {};
}
