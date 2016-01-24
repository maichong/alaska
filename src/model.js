/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class Model {
  constructor() {
    throw new Error('Can not initialize a Model before register.');
  }

  static pre() {
    console.error('开发中...');
  }

  static post() {
    console.error('开发中...');
  }

  static register() {
    let service = __service;
    let Model = this;
    Model.service = service;

    let MongooseModel;
    let name = Model.name;
    //let Model = panic;
    //eval('Model=function ' + name + '() {assert(this instanceof Model, "Please create model by \'new ' + name + '()\'");MongooseModel.apply(this, arguments);}');

    let schema = new Schema({
      title: 'string'
    });
    let groups = {};
    let fields = {};
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

    Model.pre = function (event, callback) {
      schema.pre(event, function (next) {
        let res = callback.call(this);
        if (res && res.then) {
          res.then(function () {
            next();
          }, function (error) {
            next(error);
          });
        } else {
          next();
        }
      });
      return this;
    };

    Model.post = function (event, callback) {
      schema.post(event, callback);
    };

    /**
     *
     * @param Object options
     * @returns {mongoose.Query}
     */
    Model.paginate = function (options) {
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
        callback = callback || noop;

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
    };

    //register

    let db = service.db();
    MongooseModel = db.model(name, schema);

    Model.__proto__ = MongooseModel;
    Model.prototype.__proto__ = MongooseModel.prototype;
    Model.prototype.data = function () {
      //TODO data()
      let doc = this;
      return doc.toObject();
    };
  }

}

module.exports = Model;
