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
  let keyword = ctx.state.search || ctx.query._search || '';
  let value = ctx.state.value || ctx.request.body.value || '';
  let page = parseInt(ctx.state.page || ctx.query._page) || 1;
  let limit = parseInt(ctx.state.limit || ctx.query._limit) || 100;
  if (ctx.state.all || ctx.query._all) {
    limit = 10000;
  }

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

  let titleField = Model.titleField || 'titleField';

  let filters = Model.createFilters(keyword, ctx.state.filters || ctx.query);

  let query = Model.paginate(filters).page(page).limit(limit);

  query.select(titleField + ' parent');

  let sort = ctx.state.sort || ctx.query.sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  // Alaska$PaginateResult
  let results = await query;

  let recordsMap = {};
  let records = _lodash2.default.map(results.results, record => {
    let tmp = {
      value: record.id
    };
    tmp.label = record[titleField] || tmp.value;
    if (value && value === tmp.value) {
      value = '';
    }
    if (record.parent) {
      tmp.parent = record.parent;
    }
    recordsMap[tmp.value] = true;
    return tmp;
  });

  if (value) {
    if (typeof value === 'string') {
      value = [value];
    } else if (!Array.isArray(value)) {
      value = [];
    }
    for (let id of value) {
      if (recordsMap[id]) continue;
      // $Flow
      let record = await Model.findById(id);
      if (record) {
        let tmp = {
          value: record.id,
          label: record.get(titleField) || String(id)
        };
        if (record.parent) {
          tmp.parent = record.parent;
        }
        records.unshift(tmp);
      }
    }
  }

  ctx.body = {
    service: serviceId,
    model: modelName,
    next: results.next,
    total: results.total,
    results: records
  };
};