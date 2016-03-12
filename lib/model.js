'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const collie = require('collie');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseField = require('./field');

function panic() {
  throw new Error('Can not call the function after Model register.');
}

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

class BaseModel {
  constructor() {
    throw new Error('Can not initialize a Model before register.');
  }

  //placeholder


  static pre(action, fn) {
    this._pre || (this._pre = {});
    this._pre[action] || (this._pre[action] = []);
    this._pre[action].push(fn);
  }

  static post(action, fn) {
    this._post || (this._post = {});
    this._post[action] || (this._post[action] = []);
    this._post[action].push(fn);
  }

  static register() {
    let service = __service;
    let Model = this;
    Model.service = service;

    let MongooseModel;
    let name = Model.name;
    if (!Model.fields) {
      throw new Error(name + ' model has no fields.');
    }

    let schema = Model.schema = new Schema({}, {
      collection: Model.collection || (Model.prefix || service.dbPrefix) + name.replace(/([a-z])([A-Z])/g, (a, b, c) => b + '_' + c).toLowerCase()
    });

    //将Model字段注册到Mongoose.Schema中
    for (let path in Model.fields) {
      let field = Model.fields[path];
      if (typeof field === 'function') {
        Model.fields[path] = field = { type: field };
      }
      if (_.isArray(field.type) && field.type.length === 1) {
        // type : [ OtherModel ]
        let OtherModel = field.type[0];
        field.type = 'relationship';
        field.ref = OtherModel;
        field.multi = true;
      }
      if (field.type.isModel) {
        let OtherModel = field.type;
        field.type = 'relationship';
        field.ref = OtherModel;
      }
      field.path = path;

      if (!field.type) {
        throw new Error('Field type is not specified. ' + name);
      }
      let AlaskaFieldType;
      if (field.type === String) {
        AlaskaFieldType = require('alaska-field-text');
      } else if (field.type === Date) {
        AlaskaFieldType = require('alaska-field-date');
      } else if (field.type === Boolean) {
        AlaskaFieldType = require('alaska-field-checkbox');
      } else if (field.type === Number) {
        AlaskaFieldType = require('alaska-field-number');
      } else if (typeof field.type === 'string') {
        AlaskaFieldType = require('alaska-field-' + field.type);
      } else if (typeof field.type === 'string' && field.type.init) {
        AlaskaFieldType = field.type;
      } else {
        throw new Error(`Unsupported field type for ${ Model.name }.${ path }`);
      }
      //将用户定义的选项传给Mongoose
      //console.log(AlaskaFieldType, field);
      field.type = AlaskaFieldType;
      field.label = field.label || path.toUpperCase();
      if (AlaskaFieldType.initSchema) {
        AlaskaFieldType.initSchema(field, schema, Model);
      } else {
        BaseField.initSchema.call(AlaskaFieldType, field, schema, Model);
      }
    }

    _.defaults(Model, {
      userField: 'user',
      api: false,
      searchFields: '',
      defaultSort: '',
      defaultColumns: '',
      label: Model.name,
      groups: {}
    });
    if (Model.api === 1) {
      Model.api = {
        list: 1,
        show: 1,
        count: 1,
        create: 1,
        update: 1,
        remove: 1
      };
    }

    //允许自动缓存
    if (Model.cache) {
      //保存成功后更新缓存
      Model.post('save', function () {
        Model.setCache(this);
      });
      Model.post('remove', function () {
        Model.delCache(this);
      });
    }

    Model._pre || (Model._pre = []);
    Model._post || (Model._post = []);
    ['Init', 'Validate', 'Save', 'Remove'].forEach(Action => {
      let action = Action.toLowerCase();
      {
        let preHooks = Model._pre[action] || [];
        if (Model.prototype['pre' + Action]) {
          preHooks.push(Model.prototype['pre' + Action]);
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
        delete Model._pre[action];
      }
      {
        let postHooks = [];
        if (Model.prototype['post' + Action]) {
          postHooks.push(Model.prototype['post' + Action]);
        }
        if (Model._post[action]) {
          postHooks = postHooks.concat(Model._post[action]);
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
        delete Model._post[action];
      }
    });

    {
      let keys = _.keys(Model._pre);
      if (keys.length) {
        console.warn('Unknown pre hooks ' + keys + ' of ' + name);
      }
    }

    {
      let keys = _.keys(Model._post);
      if (keys.length) {
        console.warn('Unknown post hooks ' + keys + ' of ' + name);
      }
    }

    Model.isModel = true;
    Model.title = Model.title || 'title';
    Model.pre = panic;
    Model.post = panic;
    delete Model._pre;
    delete Model._post;

    ['paginate', 'createCacheKey', 'getCache', 'setCache', 'delCache', 'castCache', 'castCacheArray', 'castModelArray'].forEach(key => {
      Model[key] = BaseModel[key];
    });

    //register

    let db = service.db();
    MongooseModel = db.model(name, schema);

    Model.MongooseModel = MongooseModel;
    Model.__proto__ = MongooseModel;
    Model.prototype.__proto__ = MongooseModel.prototype;
    Model.prototype.data = function () {
      //TODO data()
      let doc = {};
      for (let key in this.schema.tree) {
        if (key[0] == '_' || !Model.fields[key] || Model.fields[key].private) {
          continue;
        }
        doc[key] = this.get(key);
      }
      doc.id = this.id;
      doc.__proto__ = Data;
      return doc;
    };
  }

  /**
   * 分页查询
   * @param Object options
   * @returns {mongoose.Query}
   */
  static paginate(options) {
    options = options || {};
    let page = parseInt(options.page) || 1;
    let perPage = parseInt(options.perPage) || 10;
    let skip = (page - 1) * perPage;
    let search = options.search || '';

    //TODO search & filter
    let query = this.find(options.filters);

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
   * @param id
   * @returns {*}
   */
  static createCacheKey(id) {
    return `model_cache_${ this.service.name }.${ this.name }_${ id }`;
  }

  /**
   * 获取某条记录的缓存,如果没有找到缓存数据,则查询数据库
   * @param id
   * @returns {Model}
   */
  static getCache(id) {
    var _this = this;

    return _asyncToGenerator(function* () {
      //if (typeof id === 'object') {
      //  id = id.toString();
      //}
      let cache;
      let cacheKey;
      if (_this.cache) {
        //模型允许自动缓存
        cache = _this.service.cache();
        cacheKey = _this.createCacheKey(id);
        let data = yield cache.get(cacheKey);
        if (data) {
          return _this.castCache(data);
        }
      }

      //没有找到缓存数据
      let record = yield _this.findById(id);
      if (record && cache) {
        _this.setCache(record);
      }

      return record;
    })();
  }

  /**
   * 设置模型缓存
   * @param record
   */
  static setCache(record) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let cacheKey = _this2.createCacheKey(record.id);
      let cache = _this2.service.cache();
      yield cache.set(cacheKey, cache.noSerialization ? record : record.toObject(), _this2.cache);
    })();
  }

  /**
   * 删除模型缓存
   * @param id
   */
  static delCache(id) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let cacheKey = _this3.createCacheKey(id);
      let cache = _this3.service.cache();
      yield cache.del(cacheKey);
    })();
  }

  /**
   * 将object数据转为Model对象
   * @param data
   * @returns {*}
   */
  static castCache(data) {
    let cache = this.service.cache();
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
   * @param array
   * @returns {Array}
   */
  static castCacheArray(array) {
    let cache = this.service.cache();
    if (cache.noSerialization) {
      //缓存驱动不需要序列化
      return array;
    }
    return _.map(array, data => this.castCache(data));
  }

  /**
   * 将模型数组转为plain object数组
   * @param array
   * @returns {Array}
   */
  static castModelArray(array) {
    let cache = this.service.cache();
    if (cache.noSerialization) {
      //缓存驱动不需要序列化
      return array;
    }
    return _.map(array, record => record.toObject());
  }
}

BaseModel.fields = null;
BaseModel.cache = 0;
BaseModel.prefix = '';
BaseModel.collection = '';
module.exports = BaseModel;