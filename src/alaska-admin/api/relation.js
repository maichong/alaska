// @flow

import _ from 'lodash';
import alaska from 'alaska';

export default async function (ctx: Alaska$Context) {
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
    alaska.error('Invalid parameters');
  }
  let s = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.getModel(modelName);

  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let titleField = Model.titleField || 'titleField';

  let filters = Model.createFilters(keyword, ctx.state.filters || ctx.query);

  let query = Model.paginate(filters)
    .page(page)
    .limit(limit);

  query.select(titleField + ' parent');

  let sort = ctx.state.sort || ctx.query.sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  // Alaska$PaginateResult
  let results: Object = await query;

  let recordsMap = {};
  let records = _.map(results.results, (record) => {
    let tmp: Indexed<string> = {
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
      let record: Alaska$Model = await Model.findById(id);
      if (record) {
        let tmp: { value: any, label: string, parent?: any } = {
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
}
