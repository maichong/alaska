/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const alaska = require(__dirname + '/alaska');

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
exports.count = async function (ctx) {
  let Model = ctx.Model;
  let code = Model.api.count;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let filters = Model.createFilters((ctx.query.search || '').trim(), ctx.query.filters);
  ctx.status = alaska.OK;
  if (code === alaska.OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.options.userField;
    filters[userField] = ctx.user;
  }
  let count = await Model.count(filters);
  ctx.body = {
    count
  };
};

/**
 * 列表接口
 */
exports.list = async function list(ctx) {
  let Model = ctx.Model;
  let code = Model.api.list;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }

  let filters = Model.createFilters((ctx.query.search || '').trim(), ctx.query.filters);
  ctx.status = alaska.OK;
  if (code === alaska.OWNER) {
    //只允许用户列出自己的资源
    let userField = Model.options.userField;
    filters[userField] = ctx.user;
  }

  let query = Model.paginate({
    page: parseInt(ctx.query.page) || 1,
    perPage: parseInt(ctx.query.perPage) || 10,
    filters
  });
  if (Model.populations) {
    Model.populations.forEach(p => {
      if (!p.nolist) {
        //判断population选项是否不允许列表接口自动populate
        query.populate(p);
      }
    });
  }
  let results = await query;
  results.results = results.results.map(function (doc) {
    return doc.data('list');
  });
  ctx.body = results;
};

/**
 * 获取单个对象详细信息
 */
exports.show = async function show(ctx) {
  let Model = ctx.Model;
  let code = Model.api.show;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let query = Model.findById(ctx.params.id);
  if (Model.populations) {
    Model.populations.forEach(p => {
      query.populate(p);
    });
  }
  let doc = await query;
  if (!doc) {
    //404
    return;
  }
  if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  ctx.body = doc.data('show');
};

/**
 * 创建一个对象
 */
exports.create = async function (ctx) {
  let Model = ctx.Model;
  let code = Model.api.create;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let doc = new Model(ctx.request.body);
  if (code > alaska.PUBLIC) {
    let userField = Model.options.userField;
    doc.set(userField, ctx.user);
  }
  await doc.save();
  ctx.status = alaska.CREATED;
  ctx.body = {
    id: doc.id
  };
};

/**
 * 更新一个对象
 */
exports.update = async function (ctx) {
  let Model = ctx.Model;
  let code = Model.api.update;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let doc = await Model.findById(ctx.params.id);
  if (!doc) {
    //404
    return;
  }
  if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
    //404
    return;
  }
  doc.set(ctx.request.body);
  await doc.save();
  ctx.status = alaska.CREATED;
  ctx.body = {};
};

/**
 * 删除一个对象
 */
exports.remove = async function (ctx) {
  let Model = ctx.Model;
  let code = Model.api.remove;
  if (code > alaska.PUBLIC && !ctx.user) {
    //未登录,需要认证
    ctx.status = alaska.UNAUTHORIZED;
    return;
  }
  let doc = await Model.findById(ctx.params.id);
  if (!doc) {
    //204 删除成功
    ctx.status = alaska.NO_CONTENT;
    return;
  }
  if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
    ctx.status = alaska.NO_CONTENT;
    return;
  }
  await doc.remove();
  ctx.status = alaska.NO_CONTENT;
  ctx.body = {};
};
