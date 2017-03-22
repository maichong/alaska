// @flow

import _ from 'lodash';
import User from 'alaska-user/models/User';
import service from '../';

export async function paginate(ctx: Alaska$Context) {
  // $Flow
  let user: User = ctx.user || service.error(403);
  // $Flow
  let res: Alaska$PaginateResult = await User.paginate()
    .where(_.assign({ promoter: user._id }, ctx.state.filters))
    .page(parseInt(ctx.state.page || ctx.query._page) || 1)
    .limit(parseInt(ctx.state.limit || ctx.query._limit) || 10);

  ctx.body = res;
  // $Flow results 查询返回结果，类型不定 line 19
  ctx.body.results = _.map(res.results, (u) => u.data(ctx.state.scope || 'tiny'));
}
