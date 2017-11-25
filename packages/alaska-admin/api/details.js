'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function list(ctx) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let id = ctx.state.id || ctx.query._id;
  if (!serviceId || !modelName || !id) {
    _alaska2.default.error('Invalid parameters');
  }
  if (!_alaska2.default.hasService(serviceId)) {
    _alaska2.default.error('Invalid parameters');
  }
  let s = _alaska2.default.getService(serviceId);
  let Model = s.getModel(modelName);
  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let record = await Model.findById(id);
  if (!record) {
    _alaska2.default.error('Record not found');
  }
  ctx.body = record;
};