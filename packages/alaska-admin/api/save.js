'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  await ctx.checkAbility('admin');
  const user = ctx.user;
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  if (!serviceId || !modelName) {
    _alaska2.default.error('Invalid parameters');
  }

  let s = _alaska2.default.services[serviceId];
  if (!s) {
    _alaska2.default.error('Invalid parameters');
  }
  let Model = s.getModel(modelName);

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

  let record = null;
  if (id) {
    // $Flow
    let doc = await Model.findById(id);
    if (!doc) {
      _alaska2.default.error('Record not found');
    }
    record = doc;
  } else {
    record = new Model();
  }
  if (body._id === '') {
    body = _lodash2.default.omit(body, '_id');
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
};