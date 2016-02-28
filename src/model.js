/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const collie = require('collie');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function panic() {
  throw new Error('Can not call the function after Model register.');
}

class Model {
  constructor() {
    throw new Error('Can not initialize a Model before register.');
  }

  //placeholder
  static fields = null;

  static cache = 0;

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

    //整理字段列表
    let fields = {};
    for (let key in Model.fields) {
      let field = Model.fields[key];
      if (!field.type) {
        throw new Error('Field type is not specified. ' + name);
      }
      let FieldType;
      if (field.type === String) {
        FieldType = require('alaska-field-text');
      } else if (field.type === Date) {
        FieldType = require('alaska-field-date');
      } else if (field.type === Boolean) {
        FieldType = require('alaska-field-checkbox');
      } else if (field.type === Number) {
        FieldType = require('alaska-field-number');
      } else if (field.type === 'relationship') {
        //TODO
        FieldType = require('alaska-field-text');
      } else {
        //TODO
        FieldType = require('alaska-field-text');
        //FieldType = field.type;
      }
      field.type = FieldType;
      let options = {
        type: FieldType.plain
      };
      //将用户定义的选项传给Mongoose
      FieldType.init && FieldType.init(field, options);
      if (_.has(field, 'default')) {
        options.default = field.default;
      }
      fields[key] = options;
    }

    let schema = Model.schema = new Schema(fields);
    let groups = {};
    _.defaults(Model, {
      userField: 'user',
      api: false,
      searchFields: '',
      defaultSort: ''
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

    Model.pre = panic;
    Model.post = panic;

    //register

    let db = service.db();
    MongooseModel = db.model(name, schema);

    Model.__proto__ = MongooseModel;
    Model.prototype.__proto__ = MongooseModel.prototype;
    Model.prototype.data = function () {
      //TODO data()
      let doc = this;
      doc.id = doc._id;
      delete doc._id;
      return doc.toObject();
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
    return `model_cache_${this.service.name}.${this.name}_${id}`;
  }

  /**
   * 获取某条记录的缓存,如果没有找到缓存数据,则查询数据库
   * @param id
   * @returns {Model}
   */
  static async getCache(id) {
    //if (typeof id === 'object') {
    //  id = id.toString();
    //}
    let cache;
    let cacheKey;
    if (this.cache) {
      //模型允许自动缓存
      cache = this.service.cache();
      cacheKey = this.createCacheKey(id);
      let data = await cache.get(cacheKey);
      if (data) {
        return this.castCache(data);
      }
    }

    //没有找到缓存数据
    let record = await this.findById(id);
    if (record && cache) {
      this.setCache(record);
    }

    return record;
  }

  /**
   * 设置模型缓存
   * @param record
   */
  static async setCache(record) {
    let cacheKey = this.createCacheKey(record.id);
    let cache = this.service.cache();
    await cache.set(cacheKey, cache.noSerialization ? record : record.toObject(), this.cache);
  }

  /**
   * 删除模型缓存
   * @param id
   */
  static async delCache(id) {
    let cacheKey = this.createCacheKey(id);
    let cache = this.service.cache();
    await cache.del(cacheKey);
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

}

module.exports = Model;
