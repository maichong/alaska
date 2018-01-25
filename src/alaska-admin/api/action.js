// @flow

import alaska from 'alaska';
import service from '../';

export default async function (ctx: Alaska$Context) {
  await ctx.checkAbility('admin');

  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let action = ctx.state.action || ctx.query._action;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  let records = body.records || ctx.request.body.records || [];

  if (!serviceId || !modelName || !action) {
    alaska.error('Invalid parameters');
  }

  let s: Alaska$Service = ctx.alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model = s.getModel(modelName);

  if (!Model.actions || !Model.actions[action] || !Model.actions[action].sled) service.error('Invalid action');

  let actionInfo = Model.actions[action];

  let { ability } = actionInfo;

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
    // $Flow record 一定存在
    ability = ability(record, ctx.user);
  }

  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }

  if (!ability) {
    ability = `admin.${Model.key}.${action}`;
  }

  await ctx.checkAbility(ability);

  // $Flow
  const Sled: Class<Alaska$Sled> = s.getSled(actionInfo.sled);

  const recordModelName = Model.modelName.replace(/^\w/, (w) => w.toLowerCase());

  if (records.length) {
    records = await Model.find().where('_id').in(records);
  }

  await Sled.run({
    [recordModelName]: record,
    body,
    records,
    admin: ctx.user,
    ctx
  });

  ctx.body = {};
}
