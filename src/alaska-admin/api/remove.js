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
  let Model: Class<Alaska$Model<*>> = s.getModel(modelName);

  let ability = _.get(Model, 'actions.remove.ability', `admin.${Model.key}.remove`);

  if (typeof ability === 'function') {
    if (!id) {
      alaska.error('Can not invoke functional action ability without record!');
    }
  }

  let record;

  if (id) {
    record = await Model.findById(id);
    if (!record) {
      alaska.error('Record not found');
    }
  }

  if (typeof ability === 'function') {
    ability = ability(record, ctx.user);
  }

  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }

  await ctx.checkAbility(ability);

  if (id && record) {
    await record.remove();
  } else if (records) {
    for (let value of _.values(records)) {
      let r = await Model.findById(value);
      if (r) {
        await r.remove();
      }
    }
  } else {
    alaska.error('id not found');
  }

  ctx.body = {};
}
