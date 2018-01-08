// @flow

import _ from 'lodash';
import alaska from 'alaska';

export default async function (ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  const user = ctx.user;
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }

  let s = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.getModel(modelName);

  let ability = `admin.${Model.key}.`;
  if (id) {
    ability += 'update';
    if (Model.actions && Model.actions.update && Model.actions.update.ability) {
      ability = Model.actions.update.ability;
    }
  } else {
    ability += 'create';
    if (Model.actions && Model.actions.create && Model.actions.create.ability) {
      ability = Model.actions.create.ability;
    }
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
  if (body._id === '') {
    body = _.omit(body, '_id');
  }

  // 字段 ability
  for (let key of Object.keys(Model._fields)) {
    let field = Model._fields[key];

    if (!body.hasOwnProperty(key)) continue;

    // 验证Group权限
    if (field.group && Model.groups && Model.groups[field.group]) {
      let group = Model.groups[field.group];
      if (group.ability) {
        if (!(await user.hasAbility(group.ability))) {
          delete body[key];
          continue;
        }
      }
    }

    // 验证字段权限
    if (field.ability) {
      if (!(await user.hasAbility(field.ability))) {
        delete body[key];
      }
    }
  }

  record.set(body);

  await record.save();

  ctx.body = record;
}
