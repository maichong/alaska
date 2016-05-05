/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

import alaska from './alaska';
import _ from 'lodash';

/**
 * REST接口默认控制器
 * 本控制器默认关闭,开启默认REST接口,需要将Service配置中的rest项设置为true,并且打开各个模型的设置
 * 例如 `User.rest=false` 将关闭User模型所有的默认REST接口
 * `User.rest={list:1,show:1}` 将只打开list和show接口
 * 不同的数值代表:
 * > list接口   1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户列出自己的资源
 * > show接口   1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许资源所有者调用
 * > count接口  1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户统计自己的资源
 * > create接口 1:允许匿名调用此接口 2:允许认证后的用户调用
 * > update接口 1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户更新自己的资源
 * > remove接口 1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户删除自己的资源
 * @module rest
 */

/**
 * 统计接口
 */
export async function count(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.count;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let filters = Model.createFilters((ctx.state.search || ctx.query.search || '').trim(), ctx.state.filters || ctx.query.filters);
  if (Model.defaultFilters) {
    _.assign(filters, typeof Model.defaultFilters === 'function' ? Model.defaultFilters(ctx) : Model.defaultFilters);
  }
  ctx.status = alaska.OK;
  if (code === alaska.OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    filters[userField] = ctx.user;
  }
  ctx.body = {
    count: await Model.count(filters)
  };
}

/**
 * 列表接口
 */
export async function list(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.list;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }

  let filters = Model.createFilters((ctx.state.search || ctx.query.search || '').trim(), ctx.state.filters || ctx.query.filters);
  if (Model.defaultFilters) {
    _.assign(filters, typeof Model.defaultFilters === 'function' ? Model.defaultFilters(ctx) : Model.defaultFilters);
  }
  ctx.status = alaska.OK;
  if (code === alaska.OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    filters[userField] = ctx.user;
  }

  let query = Model.paginate({
    page: parseInt(ctx.state.page || ctx.query.page, 10) || 1,
    perPage: parseInt(ctx.state.perPage || ctx.query.perPage, 10) || Model.perPage || 10,
    filters
  });

  const scopeKey = ctx.state.scope || ctx.query.scope || 'list';
  if (Model.autoSelect && Model.scopes[scopeKey]) {
    //仅仅查询scope指定的字段,优化性能
    query.select(Model.scopes[scopeKey]);
  }

  _.forEach(Model.populations, p => {
    //判断scope是否不需要返回此path
    if (Model.scopes.list && !Model.scopes.list[p.path]) return;
    if (p.scopes && p.scopes[scopeKey]) {
      query.populate(_.assign({}, p, {
        select: p.scopes[scopeKey]
      }));
    } else {
      query.populate(p);
    }
  });

  let sort = ctx.state.sort || ctx.query.sort || Model.defaultSort;
  if (sort) {
    query.sort(sort);
  }

  let results = await query;
  results.results = results.results.map(doc => doc.data(scopeKey));
  ctx.body = results;
}

/**
 * 获取单个对象详细信息
 */
export async function show(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.show;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let query = Model.findById(ctx.state.id);
  if (Model.defaultFilters) {
    query.where(typeof Model.defaultFilters === 'function' ? Model.defaultFilters(ctx) : Model.defaultFilters);
  }

  const scopeKey = ctx.state.scope || ctx.query.scope || 'show';
  if (Model.autoSelect && Model.scopes[scopeKey]) {
    //仅仅查询scope指定的字段,优化性能
    query.select(Model.scopes[scopeKey]);
  }

  _.forEach(Model.populations, p => {
    //判断scope是否不需要返回此path
    if (Model.scopes.show && !Model.scopes.show[p.path]) return;
    if (!p.autoSelect && p.select) {
      query.populate(_.omit(p, 'select'));
    } else if (p.autoSelect && p.scopes && p.scopes[scopeKey]) {
      query.populate(_.assign({}, p, {
        select: p.scopes[scopeKey]
      }));
    } else {
      query.populate(p);
    }
  });

  let doc = await query;
  if (!doc) {
    //404
    return;
  }
  if (code === alaska.OWNER && doc[Model.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  ctx.body = doc.data(ctx.state.scope || ctx.query.scope || scopeKey);
}

/**
 * 创建一个对象
 */
export async function create(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.create;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let doc = new Model(ctx.state.data || ctx.request.body);
  if (code > alaska.PUBLIC) {
    let userField = Model.userField;
    doc.set(userField, ctx.user._id);
  }
  await doc.save();
  ctx.status = alaska.CREATED;
  ctx.body = doc.data('create');
}

/**
 * 更新一个对象
 */
export async function update(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.update;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let doc = await Model.findById(ctx.state.id || ctx.params.id);
  if (!doc) {
    //404
    return;
  }
  if (code === alaska.OWNER && doc[Model.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  doc.set(ctx.state.data || ctx.request.body);
  await doc.save();
  ctx.status = alaska.CREATED;
  ctx.body = {};
}

/**
 * 删除一个对象
 */
export async function remove(ctx) {
  let Model = ctx.state.Model;
  let code = Model.api.remove;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  ctx.body = {};
  let doc = await Model.findById(ctx.state.id || ctx.params.id);
  if (!doc) return;
  if (code === alaska.OWNER && doc[Model.userField].toString() !== ctx.user.id) return;
  await doc.remove();
}
