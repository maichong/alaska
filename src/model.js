/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

import _ from 'lodash';
import collie from 'collie';
import mongoose from 'mongoose';
import * as util from './util';

const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

function panic() {
  throw new Error('Can not call the function when Model has been registered.');
}

function processScope(fields, Model) {
  let keys = {};
  fields.split(' ').map(s => s.trim()).filter(s => s).forEach(s => {
    if (s === '*') {
      _.keys(Model.defaultScope).forEach(f => {
        keys[f] = 1;
      });
    } else if (s[0] === '-') {
      s = s.substr(1);
      if (!Model.defaultScope[s] && !Model.fields[s]) {
        throw new Error(`Can not find field ${Model.path}.scopes.${s} when process scopes`);
      }
      delete keys[s];
    } else if (s[0] === '@') {
      s = s.substr(1);
      let scope = Model.scopes[s];
      if (!scope) {
        throw new Error(`Can not find scope ${Model.path}.scopes.${s} when process scopes`);
      }
      _.assign(keys, scope);
    } else if (s[0] === '_') {
      s = s.substr(1);
      if (!Model.fields[s]) {
        throw new Error(`Can not find field ${Model.path}.scopes.${s} when process scopes`);
      }
      keys[s] = 1;
      keys['_' + s] = 1;
    } else {
      if (!Model.defaultScope[s] && !Model.fields[s]) {
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
    for (let i in obj.scopes) {
      obj.scopes[i] = processScope(obj.scopes[i], Model);
    }
  }
}

function processPopulation(query, pop, Model, scopeKey) {
  //判断scope是否不需要返回此path
  if (Model.scopes[scopeKey] && !Model.scopes[scopeKey][pop.path]) return;
  let config = pop;
  if (pop.autoSelect === false && pop.select) {
    config = _.omit(pop, 'select');
  } else if (pop.autoSelect !== false && pop.scopes && pop.scopes[scopeKey]) {
    config = _.assign({}, pop, {
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
    _.forEach(r.populations, (pop, key) => {
      if (Ref.populations[key]) {
        popConfig[key] = processPopulation(q, _.assign({ path: key }, Ref.populations[key], pop), Ref, scopeKey);
      }
    });
  }
  return q.then(list => {
    if (list && list.length) {
      _.forEach(popConfig, pop => {
        if (pop.select) {
          _.forEach(list, record => {
            if (!record[pop.path]) return;
            [].concat(record[pop.path]).forEach(tmp => tmp.___fields = pop.select);
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
  pick() {
    let getRecord = this.getRecord;
    let data = _.pick.apply(_, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
    if (getRecord) {
      data.getRecord = getRecord;
    }
    return data;
  },
  omit() {
    let getRecord = this.getRecord;
    let data = _.omit.apply(_, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
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
    let newValue = [];
    for (let i in value) {
      if (i * 1 != i) {
        continue;
      }
      let val = value[i];
      if (typeof val === 'object') {
        val = objectToData(val, fields);
      }
      newValue[i] = val;
    }
    return newValue;
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
export default class Model {
  //placeholder
  static fields = null;

  static cache = 0;

  static prefix = '';

  static collection = '';

  static isModel = true;

  constructor() {
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
  static register() {
    const service = this.service;
    const model = this;
    try {
      const db = service.db;
      model.db = db;

      /**
       * 模型所属服务
       * @type {alaska.Service}
       */
      model.service = service;

      /**
       * 标识模型对象
       * @type {boolean}
       */
      model.isModel = true;

      let name = model.name;
      model.id = util.nameToKey(name);
      model.key = service.id + '.' + model.id;
      model.path = service.id + '.' + model.name;

      _.defaults(model, {
        title: 'title',
        userField: 'user',
        api: false,
        searchFields: '',
        defaultFilters: null,
        defaultSort: '',
        defaultColumns: '',
        label: model.name,
        actions: {},
        groups: {}
      });

      //自动查询仅仅需要的字段
      if (model.autoSelect !== false) {
        model.autoSelect = true;
      }

      if (model.api === 1) {
        model.api = {
          list: 1,
          show: 1,
          count: 1,
          create: 1,
          update: 1,
          remove: 1
        };
      }

      let schema = model.schema = new Schema({}, {
        collection: model.collection || ((model.prefix || service.dbPrefix) + model.id.replace(/\-/g, '_'))
      });

      /**
       * init fields
       */
      try {
        if (!model.fields) {
          throw new Error(name + ' model has no fields.');
        }

        function loadFieldConfig(fieldTypeName) {
          let config = service.config(true, fieldTypeName);
          if (!config) {
            return {};
          }
          if (config.type && config.type != fieldTypeName) {
            let otherConfig = loadFieldConfig(config.type);
            return _.assign({}, config, otherConfig);
          }
          return _.clone(config);
        }

        model.defaultScope = {};
        //将Model字段注册到Mongoose.Schema中
        for (let path in model.fields) {
          try {
            let options = model.fields[path];

            /**
             * eg.
             * name : String
             */
            if (typeof options === 'function') {
              model.fields[path] = options = { type: options };
            }
            if (!options.type) {
              /**
               * eg.
               * user : {
             *   ref: User
             * }
               */
              if (options.ref) {
                options.type = 'relationship';
                if (_.isArray(options.ref) && options.ref.length === 1) {
                  options.ref = options.ref[0];
                  options.multi = true;
                }
              } else {
                throw new Error(model.name + '.' + path + ' field type not specified');
              }
            }

            /**
             * eg.
             * users : {
           *   type: [User]
           * }
             */
            if (_.isArray(options.type) && options.type.length === 1) {
              options.ref = options.type[0];
              options.type = 'relationship';
              options.multi = true;
            }

            /**
             * eg.
             * users : {
           *   type: User
           * }
             */
            if (options.type.isModel) {
              options.ref = options.type;
              options.type = 'relationship';
            }
            options.path = path;

            if (!options.type) {
              throw new Error('Field type is not specified. ' + name);
            }
            let AlaskaFieldType;
            if (typeof options.type === 'object' && options.type.plain) {
              AlaskaFieldType = options.type;
            } else {
              let fieldTypeName;
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
                throw new Error(`Unsupported field type for ${model.name}.${path}`);
              }
              delete options.type;
              _.assign(options, loadFieldConfig(fieldTypeName));
              if (options.type) {
                fieldTypeName = options.type;
              }
              AlaskaFieldType = options.type = require(fieldTypeName);
            }
            options.label = options.label || path.toUpperCase();
            let field = new AlaskaFieldType(options, schema, model);
            model.fields[path] = field;
            field.initSchema();
            if (!field.private) {
              model.defaultScope[path] = 1;
            }
          } catch (e) {
            console.error(`${service.id}.${model.name}.fields.${path} init failed!`);
            throw e;
          }
        }
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
          for (let path in model.virtuals) {
            model._virtuals[path] = true;
            let getter = model.virtuals.__lookupGetter__(path);
            if (getter) {
              model.defaultScope[path] = 1;
              schema.virtual(path).get(getter);
            }
            let setter = model.virtuals.__lookupSetter__(path);
            if (setter) {
              schema.virtual(path).set(setter);
            }
          }
        }
      } catch (e) {
        console.error(`${model.path} init virtual fields failed!`);
      }

      let needRef = false;
      /**
       * init relationships
       */
      try {
        let relationships = {};
        if (model.relationships) {
          _.forEach(model.relationships, (r, key) => {
            //'Model'
            let Ref = r.ref || service.error(`${model.path}.relationships.${key}.ref is undefined`);
            if (typeof Ref === 'string') {
              Ref = service.model(r.ref);
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

        _.forEach(model.populations, (p, key) => {
          if (!p.path && typeof key === 'string') {
            p.path = key;
          }
          if (p.filters) {
            p.match = p.filters;
          }
          let field = model.fields[p.path];
          if (!field) {
            throw new Error(`${service.id}.${model.name}.populations error, can not populate '${p.path}'`);
          }
          p.model = model.fields[p.path].ref;
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
          _.forEach(model.populations, p => {
            let Ref = model.fields[p.path].ref;
            p.ref = Ref;
            p.autoSelect = Ref.autoSelect;
            processSelect(p, Ref);
            //有多层嵌套 populations
            if (p.populations && p.model) {
              for (let k in p.populations) {
                let SubRef = p.model.fields[k].ref;
                processSelect(p.populations[k], SubRef);
              }
            }
          });

          _.forEach(model.relationships, r => {
            if (!r.populations) return;
            for (let k in r.populations) {
              let SubRef = r.ref.fields[k].ref;
              processSelect(r.populations[k], SubRef);
            }
          });
        });
      }

      if (!model.defaultColumns) {
        model.defaultColumns = ['_id'];
        if (model.title && model.fields[model.title]) {
          model.defaultColumns.push(model.title);
        }
        if (model.fields.createdAt) {
          model.defaultColumns.push('createdAt');
        }
      } else {
        model.defaultColumns = model.defaultColumns.split(' ').filter(f => f);
      }
      model.searchFields = model.searchFields.split(' ').filter(k => k && model.fields[k]);

      if (model.scopes) {
        if (model.scopes['*']) {
          model.defaultScope = processScope(model.scopes['*'], model);
        }
        for (let scope in model.scopes) {
          if (scope === '*') continue;
          model.scopes[scope] = processScope(model.scopes[scope], model);
        }
      } else {
        model.scopes = {};
      }
      if (!model.scopes.show) {
        model.scopes.show = model.defaultScope;
      }

      //允许自动缓存
      if (model.cache) {
        //保存成功后更新缓存
        model.post('save', function () {
          model.saveCache(this);
        });
        model.post('remove', function () {
          model.removeCache(this);
        });
      }

      model._pre || (model._pre = []);
      model._post || (model._post = []);
      ['Init', 'Validate', 'Save', 'Remove'].forEach(Action => {
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
                let promise = collie.compose(preHooks, [], this);
                promise.then(() => {
                  next();
                }, next);
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
                let promise = collie.compose(postHooks, [], this);
                promise.catch(function (error) {
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
          this.__methods = util.bindMethods(model._underscore, this);
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
        for (let key in fields) {
          if (key[0] === '_') continue;
          if (!model._virtuals[key]) {
            if (model.fields[key] && (model.fields[key].private || !this.isSelected(key))) continue;
            if (!model.fields[key] && (!model.relationships[key] || model.relationships[key].private)) continue;
          }
          if (fields['_' + key]) continue;
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
            } else {
              doc[key] = value;
            }
          }
        }
        doc.__proto__ = Data;
        doc.getRecord = () => this;
        return doc;
      };

      Object.getOwnPropertyNames(model.prototype).forEach(key => {
        if (key === 'constructor') return;
        schema.methods[key] = model.prototype[key];
        delete model.prototype[key];
      });

      {
        let keys = _.keys(model._pre);
        if (keys.length) {
          console.warn('Unknown pre hooks ' + keys + ' of ' + name);
        }
      }

      {
        let keys = _.keys(model._post);
        if (keys.length) {
          console.warn('Unknown post hooks ' + keys + ' of ' + name);
        }
      }

      model.registered = true;
      model.register = panic;
      model.pre = panic;
      model.post = panic;
      delete model._pre;
      delete model._post;

      [
        'list',
        'show',
        'createFilters',
        'paginate',
        'createCacheKey',
        'findCache',
        'saveCache',
        'removeCache',
        'castCache',
        'castCacheArray',
        'castModelArray'
      ].forEach(key => {
        model[key] = Model[key];
      });

      //register

      let MongooseModel = db.model(name, schema);

      /**
       * 原始Mongoose模型
       * @type mongoose.Model
       */
      model.MongooseModel = MongooseModel;
      model.__proto__ = MongooseModel;
      model.prototype.__proto__ = MongooseModel.prototype;
    } catch (e) {
      console.error(`${service.id}.${model.name}.register failed!`);
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
    let model = this;
    if (search && model.searchFields.length) {
      let searchFilters = [];
      let rx;
      let keywords = search.split(' ');
      if (keywords.length > 1) {
        rx = new RegExp(_.map(keywords, keyword => util.escapeRegExp(keyword)).join('|'), 'i');
      } else {
        rx = new RegExp(util.escapeRegExp(search), 'i');
      }
      _.forEach(model.searchFields, key => {
        searchFilters.push({
          [key]: rx
        });
      });
      if (searchFilters.length > 1) {
        result = {
          $or: searchFilters
        };
      } else {
        result = searchFilters[0];
      }
    }
    filters && _.forEach(filters, (value, key) => {
      if (model.fields[key] && model.fields[key].createFilter) {
        let filter = model.fields[key].createFilter(value, result);
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
   * 分页查询
   * @param {Object} options
   * @returns {mongoose.Query}
   */
  static paginate(options) {
    options = options || {};
    let page = parseInt(options.page) || 1;
    let perPage = parseInt(options.perPage) || 10;
    let skip = (page - 1) * perPage;
    let search = options.search || '';
    let filters = options.filters;
    if (filters && search) {
      console.error(this.name + '.paginate() keyword conflict filters');
      console.trace();
    }
    if (!filters && search) {
      filters = this.createFilters(search);
    }

    let query = this.find(filters);

    query.originalExec = query.exec;

    let results = {
      total: 0,
      page: page,
      perPage: perPage,
      totalPage: 0,
      previous: page <= 1 ? false : page - 1,
      next: false,
      results: []
    };

    query.exec = function (callback) {
      callback = callback || _.noop;

      return new Promise((resolve, reject) => {
        query.exec = query.originalExec;
        query.count((error, total) => {
          if (error) {
            reject(error);
            return
          }
          if (!total) {
            callback(null, results);
            resolve(results);
            return;
          }
          results.total = total;
          results.totalPage = Math.ceil(total / perPage);
          results.next = results.totalPage > page ? page + 1 : false;

          query.find().limit(perPage).skip(skip).exec((err, res) => {
            if (err) {
              reject(err);
              return
            }
            results.results = res;
            callback(null, results);
            resolve(results);
          });
        });
      });
    };

    return query;
  }

  /**
   * 获取数据列表高级接口
   * @param {Context} ctx
   * @param {object} [state]
   * @returns {mongoose.Query}
   */
  static list(ctx, state) {
    let Model = this;

    state = _.defaultsDeep({}, state, ctx.state);

    let filters = Model.createFilters((state.search || ctx.query.search || '').trim(), state.filters || ctx.query.filters);
    if (Model.defaultFilters) {
      _.assign(filters, typeof Model.defaultFilters === 'function' ? Model.defaultFilters(ctx) : Model.defaultFilters);
    }

    let query = Model.paginate({
      page: parseInt(state.page || ctx.query.page, 10) || 1,
      perPage: parseInt(state.perPage || ctx.query.perPage, 10) || Model.perPage || 10,
      filters
    });

    const scopeKey = state.scope || ctx.query.scope || 'list';
    if (scopeKey && Model.autoSelect && Model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(Model.scopes[scopeKey]);
    }

    let populations = [];
    _.forEach(Model.populations, pop => {
      if (processPopulation(query, pop, Model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    let scope = Model.scopes[scopeKey] || Model.defaultScope;
    let relationships = _.reduce(Model.relationships, (res, r) => {
      if (!r.private && scope[r.key]) {
        res.push(r);
      }
      return res;
    }, []);

    let sort = state.sort || ctx.query.sort || Model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    if (!relationships.length && !populations.length) {
      return query;
    }
    query._then = query.then;
    query.then = function (resolve, reject) {
      query._then(res => {
        if (!res.results.length) {
          return Promise.resolve(res);
        }
        //处理关联查询
        let promises = [];
        res.results.forEach(res => {
          relationships.forEach(r => {
            promises.push(createRelationshipQuery(r, res, scopeKey));
          });

          //populations
          populations.forEach(pop => {
            _.forEach(pop.populations, (p, path) => {
              if (res[pop.path]) {
                let Ref = pop.model;
                if (Ref && Ref.populations && Ref.populations[path]) {
                  let record = res[pop.path];
                  let config = _.assign({}, Ref.populations[path], p);
                  let promise = record.populate(config).execPopulate();
                  if (config.select) {
                    promise.then(() => {
                      if (record[path]) {
                        let poplated = Array.isArray(record[path]) ? record[path] : [record[path]];
                        poplated.forEach(tmp => tmp.___fields = config.select);
                      }
                    });
                  }
                  promises.push(promise);
                }
              }
            });
          });
        });
        return Promise.all(promises).then(() => {
          return Promise.resolve(res);
        });
      }).then(resolve, reject);
    };
    return query;
  }

  /**
   * 获取单条数据高级接口
   * @param {Context} ctx
   * @param {object} [state]
   * @returns {mongoose.Query}
   */
  static show(ctx, state) {
    let Model = this;

    state = _.defaultsDeep({}, state, ctx.state);

    let query = Model.findById(state.id || ctx.params.id);
    if (Model.defaultFilters) {
      query.where(typeof Model.defaultFilters === 'function' ? Model.defaultFilters(ctx) : Model.defaultFilters);
    }

    const scopeKey = state.scope || ctx.query.scope || 'show';
    if (Model.autoSelect && Model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(Model.scopes[scopeKey]);
    }

    let populations = [];
    _.forEach(Model.populations, pop => {
      if (processPopulation(query, pop, Model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    let scope = Model.scopes[scopeKey] || Model.defaultScope;
    let relationships = _.reduce(Model.relationships, (res, r) => {
      if (!r.private && scope[r.key]) {
        res.push(r);
      }
      return res;
    }, []);

    if (!relationships.length && !populations.length) {
      return query;
    }

    query._then = query.then;
    query.then = function (resolve, reject) {
      query._then(res => {
        if (!res) {
          return Promise.resolve(res);
        }
        //处理关联查询 relationships
        let promises = relationships.map(r => createRelationshipQuery(r, res, scopeKey));
        //populations
        populations.forEach(pop => {
          _.forEach(pop.populations, (p, path) => {
            if (res[pop.path]) {
              let Ref = pop.model;
              if (Ref && Ref.populations && Ref.populations[path]) {
                let record = res[pop.path];
                let config = _.assign({}, Ref.populations[path], p);
                let promise = record.populate(config).execPopulate();
                if (config.select) {
                  promise.then(() => {
                    if (record[path]) {
                      let poplated = Array.isArray(record[path]) ? record[path] : [record[path]];
                      poplated.forEach(tmp => tmp.___fields = config.select);
                    }
                  });
                }
                promises.push(promise);
              }
            }
          });
        });
        return Promise.all(promises).then(() => {
          return Promise.resolve(res);
        });
      }).then(resolve, reject);
    };
    return query;
  }

  /**
   * 依据记录ID,生成数据缓存所使用的cache key
   * @param {string} id
   * @returns {*}
   */
  static createCacheKey(id) {
    return `record.${this.service.id}.${this.name}.${id}`;
  }

  /**
   * 获取某条记录的缓存,如果没有找到缓存数据,则查询数据库
   * @param {string} id
   * @returns {Model}
   */
  static async findCache(id) {
    let cache;
    let cacheKey;
    if (this.cache) {
      //模型允许自动缓存
      cache = this.service.cache;
      cacheKey = this.createCacheKey(id);
      let data = await cache.get(cacheKey);
      if (data) {
        return this.castCache(data);
      }
    }

    //没有找到缓存数据
    let record = await this.findById(id);
    if (record && cache) {
      this.saveCache(record);
    }

    return record;
  }

  /**
   * 设置模型缓存
   * @param {Model} record
   */
  static async saveCache(record) {
    let cacheKey = this.createCacheKey(record.id);
    let cache = this.service.cache;
    await cache.set(cacheKey, cache.noSerialization ? record : record.toObject(), this.cache);
  }

  /**
   * 删除模型缓存
   * @param {string} id
   */
  static async removeCache(id) {
    let cacheKey = this.createCacheKey(id);
    let cache = this.service.cache;
    await cache.del(cacheKey);
  }

  /**
   * 将object数据转为Model对象
   * @param {Object} data
   * @returns {Model}
   */
  static castCache(data) {
    let cache = this.service.cache;
    if (cache.noSerialization) {
      //缓存驱动不需要序列化
      return data;
    }
    //缓存驱动需要序列化
    let record = new this(null, null, true);
    record.init(data);
    return record;
  }

  /**
   * 将object数组转为Model对象数组
   * @param {[Object]} array
   * @returns {[Model]}
   */
  static castCacheArray(array) {
    let cache = this.service.cache;
    if (cache.noSerialization) {
      //缓存驱动不需要序列化
      return array;
    }
    return _.map(array, data => this.castCache(data));
  }

  /**
   * 将模型数组转为plain object数组
   * @param {[Model]} array
   * @returns {[Object]}
   */
  static castModelArray(array) {
    let cache = this.service.cache;
    if (cache.noSerialization) {
      //缓存驱动不需要序列化
      return array;
    }
    return _.map(array, record => record.toObject());
  }
}
