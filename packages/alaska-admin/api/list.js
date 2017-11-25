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
  if (!serviceId || !modelName) {
    _alaska2.default.error('Invalid parameters');
  }
  let s = _alaska2.default.services[serviceId];
  if (!s) {
    _alaska2.default.error('Invalid parameters');
  }
  let Model = s.getModel(modelName);

  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let filters = Model.createFiltersByContext(ctx);

  let query = Model.paginate(filters).page(parseInt(ctx.state.page || ctx.query._page, 10) || 1).limit(parseInt(ctx.state.limit || ctx.query._limit, 10) || Model.defaultLimit || 50);

  let sort = ctx.state.sort || ctx.query._sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  ctx.body = await query;
};