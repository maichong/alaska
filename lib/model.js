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

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-01-24
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

const Schema = _mongoose2.default.Schema;

function panic() {
  throw new Error('Can not call the function when Model has been registered.');
}

/**
 * Data
 * @type {{pick: (function()), omit: (function())}}
 */
const Data = {
  pick() {
    let data = _lodash2.default.pick.apply(_lodash2.default, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
    return data;
  },
  omit() {
    let data = _lodash2.default.omit.apply(_lodash2.default, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
    return data;
  }
};

function objectToData(value) {
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
          val = objectToData(val);
        }
        newValue[i] = val;
      }
      return newValue;
    } else if (value.data && typeof value.data === 'function') {
      //如果也有data 函数，判定为document
      value = value.data();
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

  constructor() {
    throw new Error('Can not initialize a Model before register.');
  }

  /**
   * 注册前置钩子
   * @param {string} action 动作名称,Init|Validate|Save|Remove
   * @param {function} fn
   */

  //placeholder
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
    this._underscore || (this._underscore = {});
    this._underscore[field] || (this._underscore[field] = {});
    this._underscore[field][name] = fn;
  }

  /**
   * 注册
   */
  static register() {
    let service = this.service;
    let model = this;
    let db = service.db;
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

    let MongooseModel;
    let name = model.name;
    model.id = util.nameToKey(name);
    model.key = service.id + '.' + model.id;
    if (!model.fields) {
      throw new Error(name + ' model has no fields.');
    }

    let schema = model.schema = new Schema({}, {
      collection: model.collection || (model.prefix || service.dbPrefix) + model.id.replace(/\-/g, '_')
    });

    function loadFieldConfig(fieldTypeName) {
      let config = service.config(true, fieldTypeName);
      if (!config) {
        return {};
      }
      if (config.type && config.type != fieldTypeName) {
        let otherConfig = loadFieldConfig(config.type);
        return _lodash2.default.assign({}, config, otherConfig);
      }
      return _lodash2.default.clone(config);
    }

    //将Model字段注册到Mongoose.Schema中
    for (let path in model.fields) {
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
      if (_lodash2.default.isArray(options.type) && options.type.length === 1) {
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
          throw new Error(`Unsupported field type for ${ model.name }.${ path }`);
        }
        delete options.type;
        _lodash2.default.assign(options, loadFieldConfig(fieldTypeName));
        if (options.type) {
          fieldTypeName = options.type;
        }
        AlaskaFieldType = options.type = require(fieldTypeName);
      }
      options.label = options.label || path.toUpperCase();
      let field = new AlaskaFieldType(options, schema, model);
      model.fields[path] = field;
      field.initSchema();
    }

    _lodash2.default.defaults(model, {
      title: 'title',
      userField: 'user',
      api: false,
      searchFields: '',
      defaultFilters: null,
      defaultSort: '',
      defaultColumns: '',
      label: model.name,
      groups: {}
    });
    model.relationships = _lodash2.default.map(model.relationships, r => {
      //'Model'
      let res = {
        service: service.id,
        ref: r.ref,
        path: r.path,
        title: r.title,
        filters: r.filters
      };

      if (typeof r.ref === 'function') {
        res.ref = r.ref.name;
        if (r.ref.service) {
          res.service = r.ref.service.id;
        }
      }
      //{ref:'user.User'}
      if (res.ref.indexOf('.') > -1) {
        let arr = res.ref.split('.');
        res.service = arr[0];
        res.ref = arr[1];
      }
      return res;
    });
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

    if (!model.defaultColumns) {
      model.defaultColumns = ['_id'];
      if (model.title && model.fields[model.title]) {
        model.defaultColumns.push(model.title);
      }
      if (model.fields.createdAt) {
        model.defaultColumns.push('createdAt');
      }
    }
    if (typeof model.defaultColumns === 'string') {
      model.defaultColumns = model.defaultColumns.replace(/ /g, '').split(',');
    }

    if (typeof model.searchFields === 'string') {
      model.searchFields = _lodash2.default.filter(model.searchFields.replace(/ /g, '').split(','), key => key && model.fields[key]);
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
              let promise = _collie2.default.compose(preHooks, [], this);
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
              let promise = _collie2.default.compose(postHooks, [], this);
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
     * @returns {Data}
     */
    schema.methods.data = function () {
      let doc = {
        id: this.id
      };
      for (let key in this.schema.tree) {
        if (key[0] === '_' || !model.fields[key] || model.fields[key].private) {
          continue;
        }
        if (this._[key] && this._[key].data) {
          doc[key] = this._[key].data();
        } else {
          let value = this.get(key);
          if (typeof value === 'object') {
            doc[key] = objectToData(value);
          } else {
            doc[key] = value;
          }
        }
      }
      doc.__proto__ = Data;
      return doc;
    };

    Object.getOwnPropertyNames(model.prototype).forEach(key => {
      if (key === 'constructor') {
        return;
      }
      schema.methods[key] = model.prototype[key];
      delete model.prototype[key];
    });

    {
      let keys = _lodash2.default.keys(model._pre);
      if (keys.length) {
        console.warn('Unknown pre hooks ' + keys + ' of ' + name);
      }
    }

    {
      let keys = _lodash2.default.keys(model._post);
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

    ['createFilters', 'paginate', 'createCacheKey', 'findCache', 'saveCache', 'removeCache', 'castCache', 'castCacheArray', 'castModelArray'].forEach(key => {
      model[key] = Model[key];
    });

    //register

    MongooseModel = db.model(name, schema);

    /**
     * 原始Mongoose模型
     * @type mongoose.Model
     */
    model.MongooseModel = MongooseModel;
    model.__proto__ = MongooseModel;
    model.prototype.__proto__ = MongooseModel.prototype;
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
        rx = new RegExp(_lodash2.default.map(keywords, keyword => util.escapeRegExp(keyword)).join('|'), 'i');
      } else {
        rx = new RegExp(util.escapeRegExp(search));
      }
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
        result = searchFilters[0];
      }
    }
    filters && _lodash2.default.forEach(filters, (value, key) => {
      if (model.fields[key] && model.fields[key].createFilter) {
        let filter = model.fields[key].createFilter(value, result);
        if (filter !== undefined) {
          result[key] = filter;
        }
      }
    });
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
      previous: page <= 1 ? false : page - 1,
      next: false,
      results: []
    };

    query.exec = function (callback) {
      callback = callback || _lodash2.default.noop;

      return new Promise((resolve, reject) => {
        query.exec = query.originalExec;
        query.count((error, total) => {
          if (error) {
            reject(error);
            return;
          }
          if (!total) {
            callback(null, results);
            resolve(results);
            return;
          }
          results.total = total;
          results.next = Math.ceil(total / perPage) > page ? page + 1 : false;

          query.find().limit(perPage).skip(skip).exec((err, res) => {
            if (err) {
              reject(err);
              return;
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
   * 依据记录ID,生成数据缓存所使用的cache key
   * @param {string} id
   * @returns {*}
   */
  static createCacheKey(id) {
    return `record.${ this.service.id }.${ this.name }.${ id }`;
  }

  /**
   * 获取某条记录的缓存,如果没有找到缓存数据,则查询数据库
   * @param {string} id
   * @returns {Model}
   */
  static findCache(id) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let cache;
      let cacheKey;
      if (_this.cache) {
        //模型允许自动缓存
        cache = _this.service.cache;
        cacheKey = _this.createCacheKey(id);
        let data = yield cache.get(cacheKey);
        if (data) {
          return _this.castCache(data);
        }
      }

      //没有找到缓存数据
      let record = yield _this.findById(id);
      if (record && cache) {
        _this.saveCache(record);
      }

      return record;
    })();
  }

  /**
   * 设置模型缓存
   * @param {Model} record
   */
  static saveCache(record) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let cacheKey = _this2.createCacheKey(record.id);
      let cache = _this2.service.cache;
      yield cache.set(cacheKey, cache.noSerialization ? record : record.toObject(), _this2.cache);
    })();
  }

  /**
   * 删除模型缓存
   * @param {string} id
   */
  static removeCache(id) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let cacheKey = _this3.createCacheKey(id);
      let cache = _this3.service.cache;
      yield cache.del(cacheKey);
    })();
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
    return _lodash2.default.map(array, data => this.castCache(data));
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
    return _lodash2.default.map(array, record => record.toObject());
  }
}
exports.default = Model;
Model.fields = null;
Model.cache = 0;
Model.prefix = '';
Model.collection = '';
Model.isModel = true;