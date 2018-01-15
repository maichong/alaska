'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function remove(ctx) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let body = ctx.state.body || ctx.request.body;
  let id = body.id || ctx.request.body.id;
  let records = body.records || ctx.request.body.records;

  if (!serviceId || !modelName) {
    _alaska2.default.error('Invalid parameters');
  }

  let s = _alaska2.default.services[serviceId];
  if (!s) {
    _alaska2.default.error('Invalid parameters');
  }
  let Model = s.getModel(modelName);

  let ability = _lodash2.default.get(Model, 'actions.remove.ability', `admin.${Model.key}.remove`);

  if (typeof ability === 'function') {
    if (!id) {
      _alaska2.default.error('Can not invoke functional action ability without record!');
    }
  }

  let record;

  if (id) {
    record = await Model.findById(id);
    if (!record) {
      _alaska2.default.error('Record not found');
    }
  }

  if (typeof ability === 'function') {
    ability = ability(record);
  }

  if (ability && ability[0] === '*') {
    ability = ability.substr(1);
  }

  await ctx.checkAbility(ability);

  if (id && record) {
    await record.remove();
  } else if (records) {
    for (let value of _lodash2.default.values(records)) {
      let r = await Model.findById(value);
      if (r) {
        await r.remove();
      }
    }
  } else {
    _alaska2.default.error('id not found');
  }

  ctx.body = {};
};