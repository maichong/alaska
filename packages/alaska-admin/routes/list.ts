import * as _ from 'lodash';
import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import { Model, Filter } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import USER from 'alaska-user';
import service from '..';
import { trimPrivateField } from '../utils/utils';

interface ListQuery {
  // 模型id，必须
  _model: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  // 搜索
  _search?: number;

  // 其他的为Filter
  [key: string]: Filter;
}

export default function (router: Router) {
  router.get('/list', async (ctx: Context) => {
    if (!await USER.hasAbility(ctx.user, 'admin')) service.error('Access Denied', 403);

    const modelId = ctx.query._model || service.error('Missing model!');
    const model = Model.lookup(modelId) || service.error('Model not found!');

    // 验证 action 权限
    const ability = model.id + '.read';

    let abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) service.error('Access Denied', 403);

    let filters = mergeFilters(await model.createFiltersByContext(ctx), abilityFilters);

    let query = model.paginate(filters)
      .page(parseInt(ctx.state.page || ctx.query._page, 10) || 1)
      .limit(parseInt(ctx.state.limit || ctx.query._limit, 10) || model.defaultLimit || 50);

    let sort = ctx.state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    let populations = ctx.state.populations || ctx.query._populations;
    _.forEach(populations, (field) => {
      query.populate(field);
    });

    let result = await query;

    let list = [];
    for (let record of result.results) {
      let json = record.toJSON();
      list.push(json);
      await trimPrivateField(json, ctx.user, model, record);
    }

    ctx.body = _.assign({}, result, { results: list });
  });
}
