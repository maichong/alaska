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
  } else {
    ability += 'create';
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
  record.set(body);

  await record.save();

  ctx.body = record;
};