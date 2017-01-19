// @flow

import _ from 'lodash';
import service from '../';
import User from 'alaska-user/models/User';

export default async function (ctx:Alaska$Context) {
  let _user:?Object = ctx.user || service.error(403);
  let user:Object = _user || {};
  let obj:Object = await User.paginate({
    page: parseInt(ctx.state.page || ctx.query.page) || 1,
    perPage: parseInt(ctx.query.perPage || ctx.query.perPage) || 10,
    filters: _.assign({}, {
      promoter: user._id
    }, ctx.state.filters)
  });
  // $Flow results 查询返回结果，类型不定 line 19
  ctx.body.results = _.map(obj.results, (u) => u.data(ctx.state.scope || 'tiny'));
}
