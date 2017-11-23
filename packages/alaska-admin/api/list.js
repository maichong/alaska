// @flow

import alaska from 'alaska';

export default async function list(ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }
  let s: Alaska$Service = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.getModel(modelName);

  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let filters = Model.createFiltersByContext(ctx);

  let query: Alaska$PaginateQuery = Model.paginate(filters)
    .page(parseInt(ctx.state.page || ctx.query._page, 10) || 1)
    .limit(parseInt(ctx.state.limit || ctx.query._limit, 10) || Model.defaultLimit || 50);

  let sort = ctx.state.sort || ctx.query._sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  ctx.body = await query;
}
