// @flow

import _ from 'lodash';
import alaska from 'alaska';

function parseAbility(ability: any, data: Object, user: Object): string {
  if (typeof ability === 'function') {
    ability = ability(data, user);
  }
  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }
  return ability || '';
}

export default async function (ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  const user = ctx.user;
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }

  let s = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model<*>> = s.getModel(modelName);

  // ability 检查缓存
  let hasAbilities: Indexed<Promise<void>> = {};

  async function hasAbility(ability) {
    if (!hasAbilities[ability]) {
      hasAbilities[ability] = user.hasAbility(ability);
    }
    return await hasAbilities[ability];
  }

  async function checkAbility(ability) {
    if (!await hasAbility(ability)) {
      ctx.error('Access Denied', 403);
    }
  }

  async function saveData(data) {
    let record: ?Alaska$Model<*> = null;
    let { id } = data;

    if (id) {
      // $Flow
      let doc: Alaska$Model<*> = await Model.findById(id);
      if (!doc) {
        throw new Error('Record not found');
      }
      record = doc;
    } else {
      record = new Model();
    }
    if (data._id === '') {
      data = _.omit(data, '_id');
    }

    let action = id ? 'update' : 'create';

    let ability = _.get(Model, `actions.${action}.ability`, `admin.${Model.key}.${action}`);

    ability = parseAbility(ability, id ? record : data, ctx.user);

    await checkAbility(ability);

    // 字段 ability
    for (let key of Object.keys(Model._fields)) {
      let field = Model._fields[key];

      if (!data.hasOwnProperty(key)) continue;

      // 验证Group权限
      if (field.group && Model.groups && Model.groups[field.group]) {
        let group = Model.groups[field.group];
        let groupAbility = parseAbility(group.ability, id ? record : data, ctx.user);
        if (groupAbility && !await hasAbility(groupAbility)) {
          delete data[key];
          continue;
        }
      }

      // 验证字段权限
      let fieldAbility = parseAbility(field.ability, id ? record : data, ctx.user);
      if (fieldAbility && !await hasAbility(fieldAbility)) {
        delete data[key];
      }
    }

    record.set(data);

    await record.save();
    return record;
  }

  if (_.isArray(body)) {
    ctx.body = await Promise.all(body.map(saveData));
  } else {
    ctx.body = await saveData(body);
  }
}
