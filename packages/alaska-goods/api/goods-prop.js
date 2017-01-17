// @flow

import _ from 'lodash';

export async function list(ctx: Alaska$Context, next: Function) {
  let filters:any = ctx.state.filters || ctx.query.filters || {};
  let cat = ctx.state.cat || ctx.query.cat;
  filters.activated = true;
  if (cat) {
    filters = {
      $or: [
        {
          ...filters,
          catsIndex: cat
        },
        {
          ...filters,
          common: true
        }
      ]
    };
  }
  ctx.state.filters = filters;
  await next();
  if (cat) {
    // $Flow body类型不确定 body为object时属性和值也不固定 results确定不了类型 line 27
    _.forEach(ctx.body.results, (prop) => {
      prop.values = _.filter(prop.values, (value) => {
        let record;
        if (value.getRecord) {
          record = value.getRecord();
        }
        return !record || record.common || (record.catsIndex && record.catsIndex.indexOf(cat) > -1);
      }, []);
    });
  }
}
