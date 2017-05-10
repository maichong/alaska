// @flow

import _ from 'lodash';
import { PUBLIC, OWNER } from './alaska';

/**
 * REST接口默认控制器
 * 本控制器默认关闭,开启默认REST接口,需要将Service配置中的api项设置为true,并且打开各个模型的设置
 * 例如 `User.api=false` 将关闭User模型所有的默认REST接口
 * `User.api={list:1,show:1}` 将只打开list和show接口
 * 不同的数值代表:
 * > list接口        1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户列出自己的资源
 * > paginate接口    1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户列出自己的资源
 * > show接口        1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许资源所有者调用
 * > count接口       1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户统计自己的资源
 * > create接口      1:允许匿名调用此接口 2:允许认证后的用户调用
 * > update接口      1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户更新自己的资源
 * > updateMulti接口 1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户更新自己的资源
 * > remove接口      1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户删除自己的资源
 * > removeMulti接口 1:允许匿名调用此接口 2:允许认证后的用户调用 3:只允许用户删除自己的资源
 */

/**
 * 统计接口
 */
export async function count(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.count;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  ctx.body = {
    count: await Model.count(filters)
  };
}

/**
 * 分页列表接口
 */
export async function paginate(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.paginate;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  ctx.status = 200;

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  let results = await Model.paginateByContext(ctx, { scope, filters });

  results.results = results.results.map((doc) => doc.data(scope));
  ctx.body = results;
}

/**
 * 所有数据列表接口
 */
export async function list(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.list;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  ctx.status = 200;

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  let results = await Model.listByContext(ctx, { scope, filters });

  ctx.body = results.map((doc) => doc.data(scope));
}

/**
 * 获取单个对象详细信息
 */
export async function show(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.show;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }

  const scope = ctx.state.scope || ctx.query._scope || 'show';

  let doc = await Model.showByContext(ctx, { scope });
  if (!doc) {
    //404
    return;
  }
  // $Flow 已经确认ctx.user存在
  if (code === OWNER && doc[Model.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  ctx.body = doc.data(ctx.state.scope || ctx.query._scope || scope);
}

/**
 * 创建一个对象
 */
export async function create(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.create;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  let doc = new Model(ctx.state.body || ctx.request.body);
  if (code > PUBLIC) {
    let userField = Model.userField;
    // $Flow 已经确认ctx.user存在
    doc.set(userField, ctx.user._id);
  }
  await doc.save();
  ctx.body = doc.data('create');
}

/**
 * 更新一个对象
 */
export async function update(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.update;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  let filters = Model.createFiltersByContext(ctx);

  let doc = await Model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!doc) {
    //404
    return;
  }
  // $Flow 已经确认ctx.user存在
  if (code === OWNER && doc[Model.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  // 不允许更新private 字段
  _.forEach(Model.fields, (key, conf) => {
    if (conf.private) {
      delete body[key];
    }
  });
  doc.set(body);
  await doc.save();
  ctx.body = doc.data('update');
}

/**
 * 使用Filters同时更新多条记录
 */
export async function updateMulti(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.updateMulti;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  // 不允许更新private 字段
  _.forEach(Model.fields, (key, conf) => {
    if (conf.private) {
      delete body[key];
    }
  });

  let res = await Model.update(filters, body, { multi: true });

  ctx.body = {
    count: res.n,
    updated: res.nModified
  };
}

/**
 * 删除一个对象
 */
export async function remove(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.remove;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  ctx.body = {};

  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  let doc = await Model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!doc) return;
  await doc.remove();
}

/**
 * 使用Filters同时删除多条记录
 */
export async function removeMulti(ctx: Alaska$Context) {
  let Model = ctx.state.Model;
  let code = Model.api.removeMulti;
  if (code > PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = 401;
    return;
  }
  ctx.body = {};
  let filters = Model.createFiltersByContext(ctx);

  if (code === OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.userField;
    // $Flow 这里可以确认ctx.user存在
    filters[userField] = ctx.user._id;
  }

  let res = await Model.deleteMany(filters);

  ctx.body = {
    removed: res.result.n
  };
}
