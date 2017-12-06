'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _collie = require('collie');

var _collie2 = _interopRequireDefault(_collie);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _alaska = require('./alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { Schema } = _mongoose2.default;

// $Flow


/* eslint no-proto:0 no-unused-expressions:0 */

_mongoose2.default.Promise = global.Promise;

function panic() {
  throw new Error('Can not call the function when Model has been registered.');
}

function processScope(fields, Model) {
  if (typeof fields === 'object') return fields;
  let keys = {};
  fields.split(' ').map(s => s.trim()).filter(s => s).forEach(s => {
    if (s === '*') {
      Object.keys(Model.defaultScope).forEach(f => {
        keys[f] = 1;
      });
    } else if (s[0] === '-') {
      s = s.substr(1);
      if (!Model.defaultScope[s] && !Model.fields[s]) {
        throw new Error(`Can not find field ${Model.path}.scopes.${s} when process scopes`);
      }
      delete keys[s];
    } else if (s[0] === ':') {
      s = s.substr(1);
      let scope = Model.scopes[s];
      if (!scope) {
        throw new Error(`Can not find scope ${Model.path}.scopes.${s} when process scopes`);
      }
      if (typeof scope === 'object') {
        Object.assign(keys, scope);
      } else {
        throw new Error(`Can not init scope, ${Model.path}.scopes.${s} should be Object`);
      }
    } else if (s[0] === '_') {
      s = s.substr(1);
      if (!Model.fields[s]) {
        throw new Error(`Can not find field ${Model.path}.scopes.${s} when process scopes`);
      }
      keys[s] = 1;
      keys['_' + s] = 1;
    } else {
      if (!Model.defaultScope[s] && !Model.fields[s] && (!Model.virtuals || !Object.getOwnPropertyDescriptor(Model.virtuals, s).get)) {
        throw new Error(`Can not find field ${Model.path}.scopes.${s} when process scopes`);
      }
      keys[s] = 1;
    }
  });
  return keys;
}

function processSelect(obj, Model) {
  if (obj.select) {
    obj.select = processScope(obj.select, Model);
  }
  if (obj.scopes) {
    Object.keys(obj.scopes).forEach(i => {
      obj.scopes[i] = processScope(obj.scopes[i], Model);
    });
  }
}

function processPopulation(query, pop, Model, scopeKey) {
  //判断scope是否不需要返回此path
  if (Model.scopes[scopeKey] && !Model.scopes[scopeKey][pop.path]) return null;
  let config = pop;
  if (pop.autoSelect === false && pop.select) {
    config = _lodash2.default.omit(pop, 'select');
  } else if (pop.autoSelect !== false && pop.scopes && pop.scopes[scopeKey]) {
    config = Object.assign({}, pop, {
      select: pop.scopes[scopeKey]
    });
  }
  query.populate(config);
  return config;
}

function createRelationshipQuery(r, res, scopeKey) {
  let Ref = r.ref;
  let q = Ref.find({
    [r.path]: res._id
  });
  let sort = Ref.defaultSort;
  if (r.options) {
    sort = r.options.sort || sort;
    if (r.options.limit) {
      q.limit(r.options.limit);
    }
  }
  if (sort) {
    q.sort(sort);
  }
  if (r.filters) {
    q.where(r.filters);
  }
  if (Ref.autoSelect) {
    //自动select字段,优化查询性能
    if (r.scopes && r.scopes[scopeKey]) {
      q.select(r.scopes[scopeKey]);
    } else if (r.select) {
      q.select(r.select);
    } else if (Ref.scopes[scopeKey]) {
      q.select(Ref.scopes[scopeKey]);
    }
  }
  let popConfig = {};
  if (r.populations) {
    _lodash2.default.forEach(r.populations, (pop, key) => {
      if (Ref.populations[key]) {
        popConfig[key] = processPopulation(q, Object.assign({ path: key }, Ref.populations[key], pop), Ref, scopeKey);
      }
    });
  }
  return q.then(list => {
    if (list && list.length) {
      _lodash2.default.forEach(popConfig, pop => {
        if (pop.select) {
          _lodash2.default.forEach(list, record => {
            if (!record[pop.path]) return;
            [].concat(record[pop.path]).forEach(tmp => {
              tmp.___fields = pop.select;
            });
          });
        }
      });
    }
    res[r.key] = list;
  });
}

/**
 * Data
 * @type {{pick: (function()), omit: (function())}}
 */
const Data = {
  pick(...args) {
    let { getRecord } = this;
    let data = _lodash2.default.pick(this, ...args) || {};
    Object.setPrototypeOf(data, Data);
    if (getRecord) {
      data.getRecord = getRecord;
    }
    return data;
  },
  omit(...args) {
    let { getRecord } = this;
    let data = _lodash2.default.omit(this, ...args) || {};
    Object.setPrototypeOf(data, Data);
    if (getRecord) {
      data.getRecord = getRecord;
    }
    return data;
  }
};

function objectToData(value, fields) {
  if (!value) {
    return value;
  }
  if (value instanceof Date) {
    //时间
  } else if (value instanceof Array) {
    //数组数据
    return value.map(val => {
      if (val === 'object') {
        return objectToData(val, fields);
      }
      return val;
    });
  } else if (value.data && typeof value.data === 'function') {
    //如果也有data 函数，判定为document
    value = value.data(fields);
  } else {
    //无法判断
    //console.log(value);
  }
  return value;
}

/**
 * @class Model
 * @extends mongoose.Model
 */
class Model {

  // eslint-disable-next-line
  constructor(doc, fields, skipId) {
    throw new Error('Can not initialize a Model before register.');
  }

  /**
   * 注册前置钩子
   * @param {string} action 动作名称,Init|Validate|Save|Remove
   * @param {function} fn
   */
  static pre(action, fn) {
    this._pre || (this._pre = {});
    this._pre[action] || (this._pre[action] = []);
    this._pre[action].push(fn);
  }

  /**
   * 注册后置钩子
   * @param {string} action 动作名称,Init|Validate|Save|Remove
   * @param {function} fn
   */
  static post(action, fn) {
    this._post || (this._post = {});
    this._post[action] || (this._post[action] = []);
    this._post[action].push(fn);
  }

  /**
   * 注册underscore方法
   * @param {string} field 绑定的字段
   * @param {string} name 方法名
   * @param {Function} fn 方法
   */
  static underscoreMethod(field, name, fn) {
    delete this.__methods;
    this._underscore || (this._underscore = {});
    this._underscore[field] || (this._underscore[field] = {});
    this._underscore[field][name] = fn;
  }

  /**
   * 注册
   */
  static async register(modelName) {
    const { service } = this;
    // $Flow
    const model = this;
    model._fields = {};

    function loadFieldConfig(fieldTypeName) {
      let config = service.getConfig(fieldTypeName, undefined, true);
      if (!config) {
        return {};
      }
      if (config.type && config.type !== fieldTypeName) {
        let otherConfig = loadFieldConfig(config.type);
        return Object.assign({}, config, otherConfig);
      }
      return _lodash2.default.clone(config);
    }

    try {
      const { db } = service;
      model.db = db;

      /**
       * 模型所属服务
       * @type {Service}
       */
      model.service = service;

      /**
       * 标识模型对象
       * @type {boolean}
       */
      model.classOfModel = true;

      if (model.modelName) {
        modelName = model.modelName;
      }

      model.modelName = modelName;
      model.id = utils.nameToKey(modelName);
      model.key = service.id + '.' + model.id;
      model.path = service.id + '.' + modelName;

      _lodash2.default.defaults(model, {
        titleField: 'title',
        userField: 'user',
        api: {},
        searchFields: '',
        defaultFilters: null,
        defaultSort: '',
        defaultColumns: '',
        label: modelName,
        actions: {},
        groups: {}
      });

      //自动查询仅仅需要的字段
      if (model.autoSelect !== false) {
        model.autoSelect = true;
      }

      if (this._pre && this._pre.register) {
        await _collie2.default.compose(this._pre.register, [], this);
        delete this._pre.register;
      }
      if (typeof this.preRegister === 'function') {
        await this.preRegister();
      }

      const schema = new Schema({}, {
        collection: model.collection || (service.getConfig('dbPrefix') || '') + model.id.replace(/-/g, '_')
      });

      model.schema = schema;

      /**
       * init fields
       */
      try {
        if (!model.fields) {
          throw new Error(modelName + ' model has no fields.');
        }

        model.defaultScope = {};
        //将Model字段注册到Mongoose.Schema中
        Object.keys(model.fields).forEach(path => {
          try {
            let options = _lodash2.default.clone(model.fields[path]);

            if (!options.type) {
              /**
               * eg.
               * user : {
               *   ref: User
               * }
               */
              if (options.ref) {
                options.type = 'relationship';
                if (Array.isArray(options.ref)) {
                  // eslint-disable-next-line prefer-destructuring
                  options.ref = options.ref[0];
                  options.multi = true;
                }
              } else {
                throw new Error(modelName + '.' + path + ' field type not specified');
              }
            }

            options.path = path;

            let FieldClass = null;
            if (typeof options.type === 'object' && options.type.classOfField) {
              FieldClass = options.type;
            } else {
              let fieldTypeName = '';
              if (options.type === String) {
                fieldTypeName = 'alaska-field-text';
              } else if (options.type === Date) {
                fieldTypeName = 'alaska-field-datetime';
              } else if (options.type === Boolean) {
                fieldTypeName = 'alaska-field-checkbox';
              } else if (options.type === Object) {
                fieldTypeName = 'alaska-field-mixed';
              } else if (options.type === Number) {
                fieldTypeName = 'alaska-field-number';
              } else if (typeof options.type === 'string') {
                fieldTypeName = 'alaska-field-' + options.type;
              } else {
                throw new Error(`Unsupported field type for ${modelName}.${path}`);
              }
              delete options.type;
              Object.assign(options, loadFieldConfig(fieldTypeName));
              if (options.type && typeof options.type === 'string') {
                fieldTypeName = options.type;
              }
              FieldClass = _alaska2.default.modules.fields[fieldTypeName];
              if (!FieldClass) {
                console.error(`Field type '${fieldTypeName}' not found!`);
              }
              options.type = FieldClass;
            }
            options.label = options.label || path.toUpperCase();
            let field = new FieldClass(options, schema, model);
            model._fields[path] = field;
            field.initSchema();
            if (!field.private) {
              model.defaultScope[path] = true;
            }
          } catch (e) {
            console.error(`${service.id}.${modelName}.fields.${path} init failed!`);
            throw e;
          }
        });
      } catch (e) {
        console.error(`${model.path} init fields failed!`);
        throw e;
      }

      /**
       * init virtual fields
       */
      try {
        model._virtuals = {};
        if (model.virtuals) {
          Object.keys(model.virtuals).forEach(path => {
            model._virtuals[path] = true;
            let descriptor = Object.getOwnPropertyDescriptor(model.virtuals, path);
            if (descriptor.get) {
              model.defaultScope[path] = 1;
              schema.virtual(path).get(descriptor.get);
            }
            if (descriptor.set) {
              schema.virtual(path).set(descriptor.set);
            }
          });
        }
      } catch (e) {
        console.error(`${model.path} init virtual fields failed!`);
        throw e;
      }

      let needRef = false;
      /**
       * init relationships
       */
      try {
        let relationships = {};
        if (model.relationships) {
          _lodash2.default.forEach(model.relationships, (r, key) => {
            //'Model'
            let Ref = r.ref || service.error(`${model.path}.relationships.${key}.ref is undefined`);
            if (typeof Ref === 'string') {
              Ref = service.getModel(r.ref);
            }
            r.key = key;
            r.ref = Ref;
            if (!r.private) {
              model.defaultScope[key] = 1;
            }
            if (r.populations) {
              //有深层嵌套 populations
              needRef = true;
            }
            relationships[key] = r;
          });
        }
        model.relationships = relationships;
      } catch (e) {
        console.error(`${model.path} init relationships failed!`);
      }

      /**
       * init populations
       */
      try {
        let populations = {};

        _lodash2.default.forEach(model.populations, (p, key) => {
          if (!p.path && typeof key === 'string') {
            p.path = key;
          }
          if (p.filters) {
            p.match = p.filters;
          }
          let field = model._fields[p.path];
          if (!field) {
            throw new Error(`${service.id}.${modelName}.populations error, can not populate '${p.path}'`);
          }
          p.model = model._fields[p.path].ref;
          populations[p.path] = p;
          if (p.select || p.scopes || p.populations) {
            needRef = true;
          }
        });
        model.populations = populations;
      } catch (e) {
        console.error(`${model.path} init populations failed!`);
      }

      if (needRef) {
        service.pre('loadSleds', () => {
          _lodash2.default.forEach(model.populations, p => {
            let Ref = model._fields[p.path].ref;
            p.ref = Ref;
            p.autoSelect = Ref.autoSelect;
            processSelect(p, Ref);
            //有多层嵌套 populations
            if (p.populations && p.model) {
              _lodash2.default.forEach(p.populations, (item, k) => {
                processSelect(item, p.model._fields[k].ref);
              });
            }
          });

          _lodash2.default.forEach(model.relationships, r => {
            if (!r.populations) return;
            _lodash2.default.forEach(r.populations, (item, k) => {
              processSelect(item, r.ref._fields[k].ref);
            });
          });
        });
      }

      if (!model.defaultColumns) {
        model.defaultColumns = ['_id'];
        if (model.titleField && model._fields[model.titleField]) {
          model.defaultColumns.push(model.titleField);
        }
        if (model._fields.createdAt) {
          model.defaultColumns.push('createdAt');
        }
      } else if (typeof model.defaultColumns === 'string') {
        model.defaultColumns = model.defaultColumns.split(' ').filter(f => f);
      }

      if (model.searchFields) {
        if (typeof model.searchFields === 'string') {
          model.searchFields = model.searchFields.split(' ').filter(k => k && model._fields[k]);
        }
      } else {
        model.searchFields = [];
      }

      if (model.scopes) {
        if (model.scopes['*']) {
          model.defaultScope = processScope(model.scopes['*'], model);
        }
        _lodash2.default.forEach(model.scopes, (scopeConfig, scopeName) => {
          if (scopeName === '*') return;
          model.scopes[scopeName] = processScope(scopeConfig, model);
        });
      } else {
        model.scopes = {};
      }
      if (!model.scopes.show) {
        model.scopes.show = model.defaultScope;
      }

      model._pre || (model._pre = {});
      model._post || (model._post = {});
      ['Init', 'Validate', 'Save', 'Remove'].forEach(Action => {
        // $Flow
        let action = Action.toLowerCase();
        {
          let preHooks = model._pre[action] || [];
          if (model.prototype['pre' + Action]) {
            preHooks.push(model.prototype['pre' + Action]);
            delete model.prototype['pre' + Action];
          }

          if (preHooks.length) {
            schema.pre(action, function (next) {
              try {
                let promise = _collie2.default.compose(preHooks, [], this);
                promise.then(() => {
                  if (action === 'save' && this.__modifiedPaths) {
                    this.__modifiedPaths = this.modifiedPaths();
                  }
                  next();
                }, next);
              } catch (error) {
                next(error);
              }
            });
          } else if (action === 'save') {
            schema.pre(action, function (next) {
              try {
                if (this.__modifiedPaths) {
                  this.__modifiedPaths = this.modifiedPaths();
                }
                next();
              } catch (error) {
                next(error);
              }
            });
          }
          delete model._pre[action];
        }
        {
          let postHooks = [];
          if (model.prototype['post' + Action]) {
            postHooks.push(model.prototype['post' + Action]);
            delete model.prototype['post' + Action];
          }
          if (model._post[action]) {
            postHooks = postHooks.concat(model._post[action]);
          }
          if (postHooks.length) {
            schema.post(action, function () {
              try {
                let promise = _collie2.default.compose(postHooks, [], this);
                promise.catch(error => {
                  console.error(error.stack);
                });
              } catch (error) {
                console.error(error.stack);
              }
            });
          }
          delete model._post[action];
        }
      });

      schema.virtual('_').get(function () {
        if (!this.__methods) {
          this.__methods = utils.bindMethods(model._underscore, this);
        }
        return this.__methods;
      });

      /**
       * 返回格式化数据
       * @param {string} [scope]
       * @returns {Data}
       */
      schema.methods.data = function (scope) {
        let doc = {
          id: this.id
        };
        let fields = model.defaultScope;
        if (scope) {
          if (typeof scope === 'object') {
            fields = scope;
            scope = null;
          } else if (model.scopes[scope]) {
            fields = model.scopes[scope];
          }
        }
        _lodash2.default.forEach(fields, (any, key) => {
          if (key[0] === '_') return;
          if (!model._virtuals[key]) {
            if (model._fields[key] && (model._fields[key].private || !this.isSelected(key))) return;
            if (!model._fields[key] && (!model.relationships[key] || model.relationships[key].private)) return;
          }
          if (fields['_' + key]) return;
          if (this._[key] && this._[key].data) {
            doc[key] = this._[key].data();
          } else {
            let value = this[key];
            if (value && typeof value === 'object') {
              let p = model.populations[key];
              let _fields = value.___fields;
              if (!_fields && p) {
                if (p.scopes && p.scopes[scope]) {
                  _fields = p.scopes[scope];
                } else if (p.select) {
                  _fields = p.select;
                }
              }
              doc[key] = objectToData(value, _fields);
            } else if (value === undefined) {
              let fieldConfig = model._fields[key];
              if (fieldConfig && fieldConfig.defaultValue !== undefined) {
                doc[key] = fieldConfig.defaultValue;
              }
            } else {
              doc[key] = value;
            }
          }
        });
        Object.setPrototypeOf(doc, Data);
        doc.getRecord = () => this;
        return doc;
      };

      Object.getOwnPropertyNames(model.prototype).forEach(key => {
        if (key === 'constructor') return;
        schema.methods[key] = model.prototype[key];
        delete model.prototype[key];
      });

      {
        let keys = Object.keys(model._pre);
        if (keys.length) {
          console.warn('Unknown pre hooks ' + keys.toString() + ' of ' + modelName);
        }
      }

      {
        let keys = Object.keys(model._post);
        if (keys.length) {
          console.warn('Unknown post hooks ' + keys.toString() + ' of ' + modelName);
        }
      }

      model.registered = true;
      // $Flow
      model.register = panic;
      // $Flow
      model.pre = panic;
      // $Flow
      model.post = panic;
      delete model._pre;

      ['paginateByContext', 'listByContext', 'showByContext', 'createFilters', 'createFiltersByContext', 'paginate', 'fromObject', 'fromObjectArray', 'toObjectArray'].forEach(key => {
        // $Flow
        model[key] = Model[key];
      });

      //register

      let MongooseModel = db.model(modelName, schema);

      /**
       * 原始Mongoose模型
       * @type mongoose.Model
       */
      // $Flow
      model.MongooseModel = MongooseModel;
      Object.setPrototypeOf(model, MongooseModel);
      // $Flow
      Object.setPrototypeOf(model.prototype, MongooseModel.prototype);

      if (typeof this.postRegister === 'function') {
        await this.postRegister();
      }
      if (this._post && this._post.register) {
        await _collie2.default.compose(this._post.register, [], this);
        delete this._post.register;
      }
      delete model._post;
    } catch (e) {
      console.error(`${service.id}.${modelName}.register failed!`);
      throw e;
    }
  }

  /**
   * 创建查询过滤器
   * @param {string} [search]
   * @param {object|json} [filters]
   */
  static createFilters(search, filters) {
    if (filters && typeof filters === 'string') {
      filters = JSON.parse(filters);
    }
    let result = {};
    // $Flow
    let model = this;
    if (search && model.searchFields.length) {
      let searchFilters = [];
      let rx;
      let keywords = search.split(' ');
      if (keywords.length > 1) {
        rx = new RegExp(_lodash2.default.map(keywords, keyword => utils.escapeRegExp(keyword)).join('|'), 'i');
      } else {
        rx = new RegExp(utils.escapeRegExp(search), 'i');
      }
      // $Flow
      _lodash2.default.forEach(model.searchFields, key => {
        searchFilters.push({
          [key]: rx
        });
      });
      if (searchFilters.length > 1) {
        result = {
          $or: searchFilters
        };
      } else {
        // eslint-disable-next-line prefer-destructuring
        result = searchFilters[0];
      }
    }
    // $Flow
    _lodash2.default.forEach(filters, (value, key) => {
      if (model._fields[key] && model._fields[key].createFilter) {
        let filter = model._fields[key].createFilter(value, result);
        if (filter !== undefined) {
          result[key] = filter;
        }
      }
    });
    if (filters && filters.$or) {
      result.$or = filters.$or;
    }
    return result;
  }

  /**
   * 通过ctx创建过滤器
   * @param {Alaska$Context} ctx
   * @param {Object} [state]
   */
  static createFiltersByContext(ctx, state) {
    // $Flow
    state = _lodash2.default.defaultsDeep({}, state, ctx.state);

    // $Flow
    let model = this;
    let filters = model.createFilters((state.search || ctx.query._search || '').trim(), state.filters || ctx.query);
    if (model.defaultFilters) {
      Object.assign(filters, typeof model.defaultFilters === 'function' ? model.defaultFilters(ctx) : model.defaultFilters);
    }
    return filters;
  }

  /**
   * 分页查询
   * @param {Object} [conditions]
   * @returns {Alaska$PaginateQuery}
   */
  static paginate(conditions) {
    // $Flow
    let model = this;
    let query = model.find(conditions);

    let results = {
      total: 0,
      page: 1,
      limit: model.defaultLimit || 10,
      totalPage: 0,
      previous: 0,
      next: 0,
      results: []
    };

    // $Flow
    query.search = function (keyword) {
      let filters = model.createFilters(keyword);
      return query.where(filters);
    };

    // $Flow
    query.page = function (page) {
      results.page = page;
      results.previous = page <= 1 ? 0 : page - 1;
      return query;
    };

    let limitFn = query.limit;
    // $Flow
    query.limit = function (limit) {
      results.limit = limit;
      limitFn.call(query, limit);
      return query;
    };

    let execFn = query.exec;

    // $Flow
    query.exec = function (callback) {
      // 返回 Promise
      return (async () => {
        try {
          // $Flow
          query.exec = execFn;
          let skip = (results.page - 1) * results.limit;
          // $Flow
          let res = await query.find().skip(skip).limit(results.limit);
          results.results = res;
          if ((res.length || skip === 0) && res.length < results.limit) {
            // 优化，省略count查询
            results.total = skip + res.length;
          } else {
            results.total = await model.count(query.getQuery());
          }

          results.totalPage = Math.ceil(results.total / results.limit);
          results.next = results.totalPage > results.page ? results.page + 1 : 0;
          if (callback) callback(null, results);
          return results;
        } catch (error) {
          if (callback) callback(error);
          throw error;
        }
      })();
    };

    // $Flow
    return query;
  }

  /**
   * 获取数据分页列表高级接口
   * @param {Alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static async paginateByContext(ctx, state) {
    // $Flow
    let model = this;

    let filters = model.createFiltersByContext(ctx, state);

    state = Object.assign({}, ctx.state, state);

    let query = model.paginate(filters).page(parseInt(state.page || ctx.query._page, 10) || 1).limit(parseInt(state.limit || ctx.query._limit, 10) || model.defaultLimit || 10);

    const scopeKey = state.scope || ctx.query._scope || 'list';
    if (scopeKey && model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    let populations = [];
    _lodash2.default.forEach(model.populations, pop => {
      if (processPopulation(query, pop, model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    let scope = model.scopes[scopeKey] || model.defaultScope;
    let relationships = _lodash2.default.reduce(model.relationships, (res, r) => {
      if (!r.private && scope[r.key]) {
        res.push(r);
      }
      return res;
    }, []);

    let sort = state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    // Alaska$PaginateResult
    let results = await query;

    if (!results.results.length || !relationships.length && !populations.length) {
      return results;
    }

    //处理关联查询
    let promises = [];
    results.results.forEach(doc => {
      relationships.forEach(r => {
        promises.push(createRelationshipQuery(r, doc, scopeKey));
      });

      //populations
      populations.forEach(pop => {
        _lodash2.default.forEach(pop.populations, (p, path) => {
          if (doc[pop.path]) {
            let Ref = pop.model;
            if (Ref && Ref.populations && Ref.populations[path]) {
              let record = doc[pop.path];
              let config = Object.assign({}, Ref.populations[path], p);
              let promise = record.populate(config).execPopulate();
              if (config.select) {
                promise.then(() => {
                  if (record[path]) {
                    let poplated = Array.isArray(record[path]) ? record[path] : [record[path]];
                    poplated.forEach(tmp => {
                      tmp.___fields = config.select;
                    });
                  }
                });
              }
              promises.push(promise);
            }
          }
        });
      });
    });
    await Promise.all(promises);
    return results;
  }

  /**
   * 获取数据列表高级接口
   * @param {Alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static async listByContext(ctx, state) {
    // $Flow
    let model = this;

    let filters = model.createFiltersByContext(ctx, state);

    state = Object.assign({}, ctx.state, state);

    let query = model.find(filters);

    const scopeKey = state.scope || ctx.query._scope || 'list';
    if (scopeKey && model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    let populations = [];
    _lodash2.default.forEach(model.populations, pop => {
      if (processPopulation(query, pop, model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    let scope = model.scopes[scopeKey] || model.defaultScope;
    let relationships = _lodash2.default.reduce(model.relationships, (res, r) => {
      if (!r.private && scope[r.key]) {
        res.push(r);
      }
      return res;
    }, []);

    let sort = state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }
    let limit = parseInt(state.limit || ctx.query._limit) || 0;
    if (limit) {
      query.limit(limit);
    }
    let results = await query;

    if (!results.length || !relationships.length && !populations.length) {
      return results;
    }

    //处理关联查询
    let promises = [];
    results.forEach(doc => {
      relationships.forEach(r => {
        promises.push(createRelationshipQuery(r, doc, scopeKey));
      });

      //populations
      populations.forEach(pop => {
        _lodash2.default.forEach(pop.populations, (p, path) => {
          if (doc[pop.path]) {
            let Ref = pop.model;
            if (Ref && Ref.populations && Ref.populations[path]) {
              let record = doc[pop.path];
              let config = Object.assign({}, Ref.populations[path], p);
              let promise = record.populate(config).execPopulate();
              if (config.select) {
                promise.then(() => {
                  if (record[path]) {
                    let poplated = Array.isArray(record[path]) ? record[path] : [record[path]];
                    poplated.forEach(tmp => {
                      tmp.___fields = config.select;
                    });
                  }
                });
              }
              promises.push(promise);
            }
          }
        });
      });
    });
    await Promise.all(promises);
    return results;
  }

  /**
   * 获取单条数据高级接口
   * @param {Alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static async showByContext(ctx, state) {
    // $Flow
    let model = this;

    // $Flow
    state = _lodash2.default.defaultsDeep({}, state, ctx.state);

    let filters = model.createFilters('', ctx.state.filters || ctx.query);

    // $Flow
    let query = model.findById(state.id || ctx.params.id).where(filters);

    if (model.defaultFilters) {
      query.where(typeof model.defaultFilters === 'function' ? model.defaultFilters(ctx) : model.defaultFilters);
    }

    const scopeKey = state.scope || ctx.query._scope || 'show';
    if (model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    let populations = [];
    _lodash2.default.forEach(model.populations, pop => {
      if (processPopulation(query, pop, model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    let scope = model.scopes[scopeKey] || model.defaultScope;
    let relationships = _lodash2.default.reduce(model.relationships, (res, r) => {
      if (!r.private && scope[r.key]) {
        res.push(r);
      }
      return res;
    }, []);

    // $Flow
    let doc = await query;

    if (!doc || !relationships.length && !populations.length) {
      return doc;
    }

    //处理关联查询 relationships
    let promises = relationships.map(r => createRelationshipQuery(r, doc, scopeKey));
    //populations
    populations.forEach(pop => {
      _lodash2.default.forEach(pop.populations, (p, path) => {
        if (doc[pop.path]) {
          let Ref = pop.model;
          if (Ref && Ref.populations && Ref.populations[path]) {
            let record = doc[pop.path];
            let config = Object.assign({}, Ref.populations[path], p);
            let promise = record.populate(config).execPopulate();
            if (config.select) {
              promise.then(() => {
                if (record[path]) {
                  let poplated = Array.isArray(record[path]) ? record[path] : [record[path]];
                  poplated.forEach(tmp => {
                    tmp.___fields = config.select;
                  });
                }
              });
            }
            promises.push(promise);
          }
        }
      });
    });
    await Promise.all(promises);
    return doc;
  }

  /**
   * 将object数据转为Model对象
   * @param {Object} data
   * @returns {Model}
   */
  static fromObject(data) {
    if (data && data.instanceOfModel) {
      return data;
    }
    let record = new this(null, null, true);
    record.init(data);
    return record;
  }

  /**
   * 将object数据转为Model对象
   * @param {Array} array
   * @returns {Model[]}
   */
  static fromObjectArray(array) {
    return array.map(data => this.fromObject(data));
  }

  /**
   * 将模型数组转为plain object数组
   * @param {[Model]} array
   * @returns {[Object]}
   */
  static toObjectArray(array) {
    return _lodash2.default.map(array, record => record.toObject());
  }
}
exports.default = Model;
Model.collection = '';
Model.classOfModel = true;