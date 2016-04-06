'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remove = exports.update = exports.create = exports.show = exports.list = exports.count = undefined;


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

let count = exports.count = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.count;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }
    let filters = Model.createFilters((ctx.query.search || '').trim(), ctx.query.filters);
    if (Model.defaultFilters) {
      _lodash2.default.assign(filters, Model.defaultFilters);
    }
    ctx.status = _alaska2.default.OK;
    if (code === _alaska2.default.OWNER) {
      //只允许用户列出自己的资源
      let userField = Model.userField;
      filters[userField] = ctx.user;
    }
    ctx.body = {
      count: yield Model.count(filters)
    };
  });

  return function count(_x) {
    return ref.apply(this, arguments);
  };
})();

/**
 * 列表接口
 */


let list = exports.list = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.list;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }

    let filters = Model.createFilters((ctx.query.search || '').trim(), ctx.query.filters);
    if (Model.defaultFilters) {
      _lodash2.default.assign(filters, Model.defaultFilters);
    }
    ctx.status = _alaska2.default.OK;
    if (code === _alaska2.default.OWNER) {
      //只允许用户列出自己的资源
      let userField = Model.userField;
      filters[userField] = ctx.user;
    }

    let query = Model.paginate({
      page: parseInt(ctx.query.page, 10) || 1,
      perPage: parseInt(ctx.query.perPage, 10) || 10,
      filters
    });
    if (Model.populations) {
      Model.populations.forEach(function (p) {
        if (!p.nolist) {
          //判断population选项是否不允许列表接口自动populate
          query.populate(p);
        }
      });
    }
    let results = yield query;
    results.results = results.results.map(function (doc) {
      return doc.data('list');
    });
    ctx.body = results;
  });

  return function list(_x2) {
    return ref.apply(this, arguments);
  };
})();

/**
 * 获取单个对象详细信息
 */


let show = exports.show = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.show;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }
    let query = Model.findById(ctx.params.id);
    if (Model.defaultFilters) {
      query.where(Model.defaultFilters);
    }
    if (Model.populations) {
      Model.populations.forEach(function (p) {
        query.populate(p);
      });
    }
    let doc = yield query;
    if (!doc) {
      //404
      return;
    }
    if (code === _alaska2.default.OWNER && doc[Model.userField].toString() !== ctx.user.id) {
      //404
      return;
    }
    ctx.body = doc.data('show');
  });

  return function show(_x3) {
    return ref.apply(this, arguments);
  };
})();

/**
 * 创建一个对象
 */


let create = exports.create = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.create;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }
    let doc = new Model(ctx.request.body);
    if (code > _alaska2.default.PUBLIC) {
      let userField = Model.userField;
      doc.set(userField, ctx.user);
    }
    yield doc.save();
    ctx.status = _alaska2.default.CREATED;
    ctx.body = {
      id: doc.id
    };
  });

  return function create(_x4) {
    return ref.apply(this, arguments);
  };
})();

/**
 * 更新一个对象
 */


let update = exports.update = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.update;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }
    let doc = yield Model.findById(ctx.params.id);
    if (!doc) {
      //404
      return;
    }
    if (code === _alaska2.default.OWNER && doc[Model.userField].toString() !== ctx.user.id) {
      //404
      return;
    }
    doc.set(ctx.request.body);
    yield doc.save();
    ctx.status = _alaska2.default.CREATED;
    ctx.body = {};
  });

  return function update(_x5) {
    return ref.apply(this, arguments);
  };
})();

/**
 * 删除一个对象
 */


let remove = exports.remove = (() => {
  var ref = _asyncToGenerator(function* (ctx) {
    let Model = ctx.Model;
    let code = Model.api.remove;
    if (code > _alaska2.default.PUBLIC && !ctx.user) {
      //未登录,需要认证
      ctx.status = _alaska2.default.UNAUTHORIZED;
      return;
    }
    ctx.body = {};
    let doc = yield Model.findById(ctx.params.id);
    if (!doc) {
      //删除成功
      return;
    }
    if (code === _alaska2.default.OWNER && doc[Model.userField].toString() !== ctx.user.id) {
      return;
    }
    yield doc.remove();
  });

  return function remove(_x6) {
    return ref.apply(this, arguments);
  };
})();

var _alaska = require('./alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-01-24
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */