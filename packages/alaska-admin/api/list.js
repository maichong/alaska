// @flow

import alaska from 'alaska';

export default async function list(ctx: Alaska$Context) {
  await ctx.checkAbility('admin');
  let serviceId = ctx.state.service || ctx.query._service;
  let modelName = ctx.state.model || ctx.query._model;
  let keyword = ctx.state.search || ctx.query._search || '';
  if (!serviceId || !modelName) {
    alaska.error('Invalid parameters');
  }
  let s: Alaska$Service = alaska.services[serviceId];
  if (!s) {
    alaska.error('Invalid parameters');
  }
  let Model: Class<Alaska$Model> = s.model(modelName);

  let ability = `admin.${Model.key}.read`;
  await ctx.checkAbility(ability);

  let filters = Model.createFiltersByContext(ctx);

  let query = Model.paginate({
    page: parseInt(ctx.state.page || ctx.query._page) || 1,
    limit: parseInt(ctx.query.limit || ctx.query._limit || Model.defaultLimit) || 50,
    filters
  });

  let sort = ctx.state.sort || ctx.query.sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  ctx.body = await query;
}
