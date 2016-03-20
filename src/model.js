/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const collie = require('collie');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('./util');

function panic() {
  throw new Error('Can not call the function when Model has been registered.');
}

/**
 * Data
 * @type {{pick: (function()), omit: (function())}}
 */
const Data = {
  pick() {
    let data = _.pick.apply(_, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
    return data;
  },
  omit() {
    let data = _.omit.apply(_, [this].concat(Array.prototype.slice.call(arguments))) || {};
    data.__proto__ = Data;
    return data;
  }
};

/**
 * @class Model
 */
class Model {
  constructor() {
    throw new Error('Can not initialize a Model before register.');
  }

  //placeholder
  static fields = null;

  static cache = 0;

  static prefix = '';

  static collection = '';

  static isModel = true;

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
    this._underscore || (this._underscore = {});
    this._underscore[field] || (this._underscore[field] = {});
    this._underscore[field][name] = fn;
  }

  /**
   * 注册
   */
  static register() {
    let service = __service;
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
    if (!model.fields) {
      throw new Error(name + ' model has no fields.');
    }

    let schema = model.schema = new Schema({}, {
      collection: model.collection || ((model.prefix || service.dbPrefix) + name.replace(/([a-z])([A-Z])/g, (a, b, c) => (b + '_' + c)).toLowerCase())
    });

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
        } else if (options.type === Number) {
          fieldTypeName = 'alaska-field-number';
        } else if (typeof options.type === 'string') {
          fieldTypeName = 'alaska-field-' + options.type;
        } else {
          throw new Error(`Unsupported field type for ${model.name}.${path}`);
        }
        _.assign(options, loadFieldConfig(fieldTypeName));
        AlaskaFieldType = options.type = require(fieldTypeName);
      }
      options.label = options.label || path.toUpperCase();
      let field = new AlaskaFieldType(options, schema, model);
      model.fields[path] = field;
      field.initSchema();
    }

    schema.virtual('_').get(function () {
      if (!this.__methods) {
        this.__methods = util.bindMethods(model._underscore, this);
      }
      return this.__methods;
    });

    _.defaults(Model, {
      title: 'title',
      userField: 'user',
      api: false,
      searchFields: '',
      defaultSort: '',
      defaultColumns: '',
      label: model.name,
      groups: {}
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
      model.searchFields = _.filter(model.searchFields.replace(/ /g, '').split(','), key => key && model.fields[key]);
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

    MongooseModel = db.model(name, schema);

    /**
     * 原始Mongoose模型
     * @type mongoose.Model
     */
    model.MongooseModel = MongooseModel;
    model.__proto__ = MongooseModel;
    model.prototype.__proto__ = MongooseModel.prototype;

    /**
     * 返回格式化数据
     * @returns {Data}
     */
    model.prototype.data = function () {
      //TODO data()
      let doc = {};
      for (let key in this.schema.tree) {
        if (key[0] == '_' || !model.fields[key] || model.fields[key].private) {
          continue;
        }
        if (this._[key] && this._[key].data) {
          doc[key] = this._[key].data();
        } else {
          doc[key] = this.get(key);
        }
      }
      doc.id = this.id;
      doc.__proto__ = Data;
      return doc;
    };
  }

  /**
   * 创建查询过滤器
   * @param {string} search
   * @param {object|json} filters
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
        rx = new RegExp(util.escapeRegExp(search));
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
    return result;
  }

  /**
   * 分页查询
   * @param {object} options
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
      callback = callback || _.noop;

      return new Promise(function (resolve, reject) {
        query.exec = query.originalExec;
        query.count(function (error, total) {
          if (error) {
            return reject(error);
          }
          if (!total) {
            callback(null, results);
            resolve(results);
            return;
          }
          results.total = total;
          results.next = Math.ceil(total / perPage) > page ? page + 1 : false;

          query.find().limit(perPage).skip(skip).exec(function (error, res) {
            if (error) {
              return reject(error);
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
    return `model_cache_${this.service.name}.${this.name}_${id}`;
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
   * @param data
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
   * @returns {array}
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

module.exports = Model;
