'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseAbility(ability, data) {
  if (typeof ability === 'function') {
    ability = ability(data);
  }
  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }
  return ability || '';
}

exports.default = async function (ctx) {
  await ctx.checkAbility('admin');
  const user = ctx.user;
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  if (!serviceId || !modelName) {
    _alaska2.default.error('Invalid parameters');
  }

  let s = _alaska2.default.services[serviceId];
  if (!s) {
    _alaska2.default.error('Invalid parameters');
  }
  let Model = s.getModel(modelName);

  // ability 检查缓存
  let hasAbilities = {};

  async function hasAbility(ability) {
    if (!hasAbilities[ability]) {
      hasAbilities[ability] = user.hasAbility(ability);
    }
    return await hasAbilities[ability];
  }

  async function checkAbility(ability) {
    if (!(await hasAbility(ability))) {
      ctx.error('Access Denied', 403);
    }
  }

  async function saveData(data) {
    let record = null;
    let { id } = data;

    if (id) {
      // $Flow
      let doc = await Model.findById(id);
      if (!doc) {
        throw new Error('Record not found');
      }
      record = doc;
    } else {
      record = new Model();
    }
    if (data._id === '') {
      data = _lodash2.default.omit(data, '_id');
    }

    let action = id ? 'update' : 'create';

    let ability = _lodash2.default.get(Model, `actions.${action}.ability`, `admin.${Model.key}.${action}`);

    ability = parseAbility(ability, id ? record : data);

    await checkAbility(ability);

    // 字段 ability
    for (let key of Object.keys(Model._fields)) {
      let field = Model._fields[key];

      if (!data.hasOwnProperty(key)) continue;

      // 验证Group权限
      if (field.group && Model.groups && Model.groups[field.group]) {
        let group = Model.groups[field.group];
        let groupAbility = parseAbility(group.ability, id ? record : data);
        if (groupAbility && !(await hasAbility(groupAbility))) {
          delete data[key];
          continue;
        }
      }

      // 验证字段权限
      let fieldAbility = parseAbility(field.ability, id ? record : data);
      if (fieldAbility && !(await hasAbility(fieldAbility))) {
        delete data[key];
      }
    }

    record.set(data);

    await record.save();
    return record;
  }

  if (_lodash2.default.isArray(body)) {
    ctx.body = await Promise.all(body.map(saveData));
  } else {
    ctx.body = await saveData(body);
  }
};