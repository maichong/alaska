'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const alaska = require(__dirname + '/alaska');

/**
 * REST接口默认控制器
 * 本控制器默认关闭,开启默认REST接口,需要将PKG配置中的rest项设置为true,并且打开各个模型的设置
 * 例如 `UserModel.options.rest=false` 将关闭UserModel模型所有的默认REST接口
 * `UserModel.options.rest={list:1,show:1}` 将只打开list和show接口
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
exports.count = function () {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.count;
    if (code > alaska.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = alaska.UNAUTHORIZED;
      return;
    }
    //TODO filters keyword
    let filters = ctx.query.filters || {};
    ctx.status = alaska.OK;
    if (code === alaska.OWNER) {
      //只允许用户列出自己的资源
      let userField = Model.options.userField;
      filters[userField] = ctx.user;
    }
    let count = yield Model.count(filters);
    ctx.body = {
      count
    };
  });

  return function (_x) {
    return ref.apply(this, arguments);
  };
}();

/**
 * 列表接口
 */
exports.list = function () {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.list;
    if (code > alaska.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = alaska.UNAUTHORIZED;
      return;
    }

    //TODO filters
    let filters = ctx.query.filters || {};
    ctx.status = alaska.OK;
    if (code === alaska.OWNER) {
      //只允许用户列出自己的资源
      let userField = Model.options.userField;
      filters[userField] = ctx.user;
    }

    let results = yield Model.paginate({
      page: parseInt(ctx.query.page) || 1,
      perPage: parseInt(ctx.query.perPage) || 10,
      search: (ctx.query.search || '').trim(),
      filters
    });
    results.results = results.results.map(function (doc) {
      return doc.data('list');
    });
    ctx.body = results;
  });

  return function list(_x2) {
    return ref.apply(this, arguments);
  };
}();

/**
 * 获取单个对象详细信息
 */
exports.show = function () {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.show;
    if (code > alaska.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = alaska.UNAUTHORIZED;
      return;
    }
    let doc = yield Model.findById(ctx.params.id);
    if (!doc) {
      //404
      return;
    }
    if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
      //404
      return;
    }
    ctx.body = doc.data('show');
  });

  return function show(_x3) {
    return ref.apply(this, arguments);
  };
}();

/**
 * 创建一个对象
 */
exports.create = function () {
  var ref = _asyncToGenerator(function* (ctx) {
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
    yield doc.save();
    ctx.status = alaska.CREATED;
    ctx.body = {
      id: doc.id
    };
  });

  return function (_x4) {
    return ref.apply(this, arguments);
  };
}();

/**
 * 更新一个对象
 */
exports.update = function () {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.update;
    if (code > alaska.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = alaska.UNAUTHORIZED;
      return;
    }
    let doc = yield Model.findById(ctx.params.id);
    if (!doc) {
      //404
      return;
    }
    if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
      //404
      return;
    }
    doc.set(ctx.request.body);
    yield doc.save();
    ctx.status = alaska.CREATED;
    ctx.body = {};
  });

  return function (_x5) {
    return ref.apply(this, arguments);
  };
}();

/**
 * 删除一个对象
 */
exports.remove = function () {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.remove;
    if (code > alaska.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = alaska.UNAUTHORIZED;
      return;
    }
    let doc = yield Model.findById(ctx.params.id);
    if (!doc) {
      //204 删除成功
      ctx.status = alaska.NO_CONTENT;
      return;
    }
    if (code === alaska.OWNER && doc[Model.options.userField].toString() !== ctx.user.id) {
      ctx.status = alaska.NO_CONTENT;
      return;
    }
    yield doc.remove();
    ctx.status = alaska.NO_CONTENT;
    ctx.body = {};
  });

  return function (_x6) {
    return ref.apply(this, arguments);
  };
}();