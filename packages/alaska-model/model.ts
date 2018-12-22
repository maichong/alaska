import * as _ from 'lodash';
import * as collie from 'collie';
import * as mongoose from 'mongoose';
import * as escape from 'escape-string-regexp';
import { MainService, Service, ObjectMap } from 'alaska';
import { Context, ContextState } from 'alaska-http';
import {
  Model as ModelType,
  ModelSettings,
  Field,
  FieldOption,
  Document,
  ModelRelationship,
  ModelPopulation,
  ModelFieldList,
  FilterValue,
  FilterObject,
  Filters,
  ModelHookName,
  PaginateQuery,
  PaginateResult,
  DocumentQuery
} from 'alaska-model';
import { Data, objectToData } from './data';
import { processScope, bindMethods, deepClone, loadFieldConfig, processPopulation } from './utils';

function panic() {
  throw new Error('Can not call the function when Model has been initialized.');
}

export default class Model {
  static classOfModel = true;
  static modelName: string;
  static key: string;
  static id: string;
  static main: MainService;
  static service: Service;

  // action name -> Function[]
  static _pre: ObjectMap<Function[]>;

  // action name -> Function[]
  static _post: ObjectMap<Function[]>;

  /**
   * field path -> underscore name -> Function
   */
  static _underscore: ObjectMap<ObjectMap<Function>>;

  /**
   * 查找模型类
   * @param {string} ref modelName or id
   */
  static lookup(ref: string): typeof ModelType | null {
    let service: Service = this.service || this.main;
    if (ref.indexOf('.') > -1) {
      let [serviceId, modelName] = ref.split('.');
      ref = modelName;
      let serviceModule = this.main.modules.services[serviceId];
      if (!serviceModule) return null;
      service = serviceModule.service;
    }
    return service.models[ref] || null;
  }

  /**
   * 配置模型
   * @param {ModelSettings} config
   */
  static applySettings(settings: ModelSettings): void {
    // @ts-ignore
    let model: typeof ModelType = this;
    if (settings.virtuals) {
      if (!model.virtuals) {
        model.virtuals = settings.virtuals;
      } else {
        Object.keys(settings.virtuals).forEach((path) => {
          let getter = settings.virtuals.__lookupGetter__(path);
          let setter = settings.virtuals.__lookupSetter__(path);
          Object.defineProperty(model.virtuals, path, {
            get: getter,
            set: setter,
            enumerable: true
          });
        });
      }
    }
    if (settings.methods) {
      Object.assign(model.prototype, settings.methods);
    }

    ['fields', 'groups', 'populations', 'relationships', 'actions'].forEach((key: keyof ModelSettings) => {
      if (settings[key]) {
        // @ts-ignore indexer
        model[key] = deepClone(model[key], settings[key]);
      }
    });

    if (settings.scopes) {
      if (!model.scopes) {
        model.scopes = settings.scopes;
      } else {
        _.forEach(settings.scopes, (fields, key) => {
          if (model.scopes[key]) {
            model.scopes[key] += ` ${fields}`;
          } else {
            model.scopes[key] = fields;
          }
        });
      }
    }

    //扩展模型事件
    ['Register', 'Init', 'Validate', 'Save', 'Remove'].forEach((Action: string) => {
      // @ts-ignore
      let pre = settings[`pre${Action}`];
      if (pre) {
        // @ts-ignore
        model.pre(Action.toLowerCase(), pre);
      }
      // @ts-ignore
      let post = settings[`post${Action}`];
      if (post) {
        // @ts-ignore
        model.post(Action.toLowerCase(), post);
      }
    });

    // 其他可以直接覆盖的字段
    _.keys(settings).forEach((key) => {
      if (
        [
          'fields',
          'groups',
          'scopes',
          'populations',
          'relationships',
          'actions',
          'methods',
          'virtuals'
        ].indexOf(key) === -1
        && !/^(pre|post)(Register|Init|Validate|Save|Remove)$/.test(key)
      ) {
        // @ts-ignore
        model[key] = settings[key];
      }
    });
    // end of Model settings
  }

  /**
   * 注册underscore方法
   * @param {string} field 绑定的字段
   * @param {string} name 方法名
   * @param {Function} fn 方法
   */
  static underscoreMethod(field: string, name: string, fn: Function) {
    this._underscore || (this._underscore = {});
    this._underscore[field] || (this._underscore[field] = {});
    this._underscore[field][name] = fn;
  }

  /**
   * 注册前置钩子
   * @param {string} action 钩子名称,init|validate|save|remove
   * @param {function} fn
   */
  static pre(action: ModelHookName, fn: Function): void {
    this._pre || (this._pre = {});
    this._pre[action] || (this._pre[action] = []);
    this._pre[action].push(fn);
  }

  /**
   * 注册后置钩子
   * @param {string} action 钩子名称,init|validate|save|remove
   * @param {function} fn
   */
  static post(action: ModelHookName, fn: Function): void {
    this._post || (this._post = {});
    this._post[action] || (this._post[action] = []);
    this._post[action].push(fn);
  }

  /**
   * 动态给模型增加字段
   */
  static addField(path: string, options: FieldOption) {
    // @ts-ignore
    const model: typeof ModelType = this;
    const { modelName, service, schema } = model;

    if (!schema) throw new Error('Can not exec Model.addField() before register!');
    if (model._fields.hasOwnProperty(path)) throw new Error(`Field alread exists [${model.id}.fields.${path}]`);

    options.path = path;
    let orgType = options.type;

    // ...

    let FieldClass: typeof Field = null;
    if (options.type && typeof options.type === 'object' && (<any>options.type).classOfField) {
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
        fieldTypeName = `alaska-field-${options.type}`;
        // @ts-ignore Model.classOfModel
      } else if (typeof options.type === 'function' && options.type.classOfModel) {
        fieldTypeName = `alaska-field-subdoc`;
        // @ts-ignore 省略 ref 时，type 就为ref model
        options.ref = options.type;
      } else {
        throw new Error(`Unsupported field type for ${modelName}.${path}`);
      }
      delete options.type;
      _.assign(options, loadFieldConfig(service, fieldTypeName));
      if (options.type && typeof options.type === 'string') {
        fieldTypeName = options.type;
      }
      FieldClass = service.main.modules.libraries[fieldTypeName];
      if (!FieldClass) {
        throw new Error(`Field type '${fieldTypeName}' not found!`);
      }
      options.type = FieldClass;
    }
    options.label = options.label || (path === '_id' ? 'ID' : path.toUpperCase());
    let field = new FieldClass(options, schema, model);
    model._fields[path] = field;
    if (path !== '_id' || orgType !== 'objectid') { // 默认 _id 不需要执行 initSchema，否则创建数据将失败
      field.initSchema();
    }
    if (field.protected !== true) {
      model.defaultScope[path] = 1;
    }
  }

  static async register(): Promise<void> {
    // @ts-ignore
    const model: typeof ModelType = this;
    const me = this;
    const { modelName, service } = this;

    try {
      // pre register hooks
      if (this._pre && this._pre.register) {
        await collie.compose(this._pre.register, [], this);
        delete this._pre.register;
      }
      // @ts-ignore
      if (typeof this.preRegister === 'function') {
        // @ts-ignore
        await this.preRegister();
      }

      const schema = new mongoose.Schema({}, {
        ...model.schemaOptions,
        collection: model.collectionName || ((service.config.get('alaska-model.collection-prefix') || '') + model.key.replace(/-/g, '_'))
      });

      model.schema = schema;

      /**
       * init fields
       */
      {
        if (!model.fields) {
          throw new Error(`${model.id} has no fields.`);
        }

        let keys = Object.keys(model.fields);

        if (!model.fields._id) {
          keys.unshift('_id');
          model.fields._id = {
            type: 'objectid',
            view: ''
          };
        }

        model.defaultScope = {};

        keys.forEach((path) => {
          try {
            let options: FieldOption = _.clone(model.fields[path]);

            this.addField(path, options);

          } catch (e) {
            console.error(`${model.id}.fields.${path} init failed!`);
            throw e;
          }
        });
      }

      /**
      * init virtual fields
      */
      try {
        model._virtuals = {};
        if (model.virtuals) {
          Object.keys(model.virtuals).forEach((path) => {
            model._virtuals[path] = 1;
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
        console.error(`${model.id} init virtual fields failed!`);
        throw e;
      }

      // 有深层嵌套 populations
      let needRef = false;

      /**
       * init relationships
       */
      try {
        let relationships: ObjectMap<ModelRelationship> = {};
        if (model.relationships) {
          _.forEach(model.relationships, (r: ModelRelationship, key: string) => {
            let Ref: string | typeof ModelType = r.ref || service.error(`${model.id}.relationships.${key}.ref is undefined`);
            if (typeof Ref === 'string') {
              Ref = model.lookup(<string>r.ref);
            }
            r.key = key;
            r.ref = Ref;
            if (!r.protected) {
              model.defaultScope[key] = 1;
            }
            if (_.size(r.populations)) {
              // 有深层嵌套 populations
              needRef = true;
            }
            relationships[key] = r;
          });
        }
        model.relationships = relationships;
      } catch (e) {
        console.error(`${model.id} init relationships failed!`);
      }

      /**
       * init populations
       */
      try {
        let populations: ObjectMap<ModelPopulation> = {};

        _.forEach(model.populations, (p: ModelPopulation, key: string) => {
          if (!p.path && typeof key === 'string') {
            p.path = key;
          }
          let field: Field = model._fields[p.path];
          if (!field) {
            throw new Error(`${service.id}.${modelName}.populations error, can not populate '${p.path}'`);
          }
          // @ts-ignore RelationshipField 存在 ref
          p.model = model._fields[p.path].ref;
          populations[p.path] = p;
          if (p.select || p.scopes || p.populations) {
            needRef = true;
          }
        });
        model.populations = populations;
      } catch (e) {
        console.error(`${model.id} init populations failed!`);
      }

      if (needRef) {
        // TODO:
        // service.pre('loadSleds', () => {
        //   _.forEach(model.populations, (p: ModelPopulation) => {
        //     let Ref: typeof ModelType = model._fields[p.path].ref;
        //     p.ref = Ref;
        //     p.autoSelect = Ref.autoSelect;
        //     processSelect(p, Ref);
        //     //有多层嵌套 populations
        //     if (p.populations && p.model) {
        //       _.forEach(p.populations, (item, k) => {
        //         processSelect(item, p.model._fields[k].ref);
        //       });
        //     }
        //   });

        //   _.forEach(model.relationships, (r) => {
        //     if (!r.populations) return;
        //     _.forEach(r.populations, (item, k) => {
        //       processSelect(item, r.ref._fields[k].ref);
        //     });
        //   });
        // });
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
        model.defaultColumns = model.defaultColumns.split(' ').filter((f: string) => f);
      }

      if (model.searchFields) {
        if (typeof model.searchFields === 'string') {
          model.searchFields = model.searchFields.split(' ').filter((k: string) => k && model._fields[k]);
        }
      } else {
        model.searchFields = [];
      }

      if (model.scopes) {
        if (model.scopes['*']) {
          model.defaultScope = processScope(model.scopes['*'], model);
        }
        _.forEach(model.scopes, (scopeConfig: string, scopeName: string) => {
          if (scopeName === '*') return;
          model._scopes[scopeName] = processScope(scopeConfig, model);
        });
      }
      if (!model._scopes.show) {
        model._scopes.show = model.defaultScope;
      }

      /**
       * Hooks
       */
      this._pre || (this._pre = {});
      this._post || (this._post = {});
      ['init', 'validate', 'save', 'remove'].forEach((action) => {
        let Action = action[0].toUpperCase() + action.substr(1);
        {
          let preHooks = this._pre[action] || [];
          // @ts-ignore
          if (model.prototype[`pre${Action}`]) {
            // @ts-ignore
            preHooks.push(model.prototype[`pre${Action}`]);
            // @ts-ignore
            delete model.prototype[`pre${Action}`];
          }

          if (preHooks.length) {
            schema.pre(action, function (next: Function) {
              try {
                // @ts-ignore
                let doc: Document = this;
                let promise = collie.compose(preHooks, [], doc);
                promise.then(() => {
                  if (action === 'save' && doc.__modifiedPaths) {
                    doc.__modifiedPaths = doc.modifiedPaths();
                  }
                  next();
                }, (e) => next(e));
              } catch (error) {
                next(error);
              }
            });
          } else if (action === 'save') {
            schema.pre(action, function (next) {
              // @ts-ignore
              let doc: Document = this;
              try {
                if (doc.__modifiedPaths) {
                  doc.__modifiedPaths = doc.modifiedPaths();
                }
                next();
              } catch (error) {
                next(error);
              }
            });
          }
          delete this._pre[action];
        }
        {
          let postHooks: Function[] = [];
          // @ts-ignore
          if (model.prototype[`post${Action}`]) {
            // @ts-ignore
            postHooks.push(model.prototype[`post${Action}`]);
            // @ts-ignore
            delete model.prototype[`post${Action}`];
          }
          if (this._post[action]) {
            postHooks = postHooks.concat(this._post[action]);
          }
          if (postHooks.length) {
            schema.post(action, function () {
              try {
                let promise = collie.compose(postHooks, [], this);
                promise.catch((error) => {
                  console.error(error.stack);
                });
              } catch (error) {
                console.error(error.stack);
              }
            });
          }
          delete this._post[action];
        }
      });

      schema.virtual('_').get(function () {
        if (!this.__methods) {
          this.__methods = bindMethods(me._underscore || {}, this);
        }
        return this.__methods;
      });


      /**
       * 返回格式化数据
       * @param {string} [scope]
       * @returns {Data}
       */
      schema.methods.data = function (scope: string | ModelFieldList) {
        let doc: { [key: string]: any } = {
          id: typeof this._id === 'number' ? this._id : this.id
        };
        let fields: ModelFieldList = model.defaultScope;
        if (scope) {
          if (typeof scope === 'object') {
            fields = scope;
            scope = null;
          } else if (model._scopes[scope]) {
            fields = model._scopes[scope];
          }
        }
        _.forEach(fields, (any, key) => {
          if (key[0] === '_') return;
          if (!model._virtuals[key]) {
            if (model._fields[key] && (model._fields[key].protected === true || !this.isSelected(key))) return;
            if (!model._fields[key] && (!model.relationships[key] || model.relationships[key].protected)) return;
          }
          if (fields[`_${key}`]) return;
          if (this._[key] && this._[key].data) {
            doc[key] = this._[key].data();
          } else {
            let value = this[key];
            if (value && typeof value === 'object') {
              let p = model.populations[key];
              let _fields: ModelFieldList = value.___fields;
              if (!_fields && p) {
                if (p.scopes && typeof scope === 'string' && p.scopes[scope]) {
                  _fields = p._scopes[scope];
                } else if (p.select) {
                  _fields = p._select;
                }
              }
              doc[key] = objectToData(value, _fields);
            } else if (typeof value === 'undefined') {
              let fieldConfig = model._fields[key];
              if (fieldConfig && typeof fieldConfig.defaultValue !== 'undefined') {
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

      Object.getOwnPropertyNames(model.prototype).forEach((key: string) => {
        if (key === 'constructor') return;
        // @ts-ignore
        schema.methods[key] = model.prototype[key];
        // @ts-ignore
        delete model.prototype[key];
      });

      [
        'addField',
        'paginateByContext',
        'listByContext',
        'showByContext',
        'createFilters',
        'createFiltersByContext',
        'paginate',
        'fromObject',
        'fromObjectArray',
        'toObjectArray'
      ].forEach((key) => {
        // @ts-ignore
        model[key] = Model[key];
      });

      model.applySettings = () => {
        throw new Error('Can not apply model settings after initialized');
      };

      // register

      let db: mongoose.Connection = model.db || service.db;
      if (!db) {
        let dbConfig = service.config.get('alaska-model.mongodb', null, true);
        if (!dbConfig || !dbConfig.uri) throw new Error('Missing database configure [alaska-model.mongodb.uri]');
        service.debug(`Connecting ${dbConfig.uri}`);
        db = await mongoose.createConnection(dbConfig.uri, _.assign({
          autoReconnect: true,
          useCreateIndex: true,
          useNewUrlParser: true
        }, dbConfig.options));
        service.db = db;
      }

      let MongooseModel = db.model(modelName, schema);

      /**
       * 原始Mongoose模型
       * @type mongoose.Model
       */
      model.MongooseModel = MongooseModel;
      model.collection = MongooseModel.collection;
      Object.setPrototypeOf(model, MongooseModel);
      Object.setPrototypeOf(model.prototype, MongooseModel.prototype);

      // post register hooks
      // @ts-ignore
      if (typeof this.postRegister === 'function') {
        // @ts-ignore
        await this.postRegister();
      }
      if (this._post && this._post.register) {
        await collie.compose(this._post.register, [], this);
        delete this._post.register;
      }

      {
        let keys = Object.keys(this._pre);
        if (keys.length) {
          console.warn(`Unknown pre hooks ${keys.toString()} of ${modelName}`);
        }
      }

      {
        let keys = Object.keys(this._post);
        if (keys.length) {
          console.warn(`Unknown post hooks ${keys.toString()} of ${modelName}`);
        }
      }

      model.pre = panic;
      model.post = panic;
      delete this._pre;
      delete this._post;

    } catch (e) {
      console.error(`${model.id}.init failed!`);
      throw e;
    }
  }

  /**
   * 创建查询过滤器
   * @param {string} [search]
   * @param {Object} [filters]
   */
  static createFilters(search: string, filters?: Filters): Filters {
    // if (filters && typeof filters === 'string') {
    //   filters = JSON.parse(filters);
    // }
    let result: Filters = {};
    // @ts-ignore
    let model: typeof ModelType = this;
    if (search && model.searchFields.length) {
      let searchFilters: Filters[] = [];
      let exp: RegExp;
      let keywords = search.split(' ');
      if (keywords.length > 1) {
        exp = new RegExp(_.map(keywords, (keyword) => escape(keyword)).join('|'), 'i');
      } else {
        exp = new RegExp(escape(search), 'i');
      }
      _.forEach(model.searchFields, (key) => {
        searchFilters.push({
          [key]: exp
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

    _.forEach(filters, (value, path) => {
      let field = model._fields[path];
      if (!field) return;
      if (value instanceof RegExp) {
        // @ts-ignore
        result[path] = value;
      } else if (_.isPlainObject(value)) {
        // @ts-ignore
        let object: FilterObject = value;
        let filter: FilterObject = {};
        ['$gt', '$gte', '$ne', '$eq', '$lt', '$lte'].forEach((op: keyof FilterObject) => {
          let v = object[op];
          if (typeof v !== 'undefined') {
            v = field.parse(v);
            if (v !== null) {
              filter[op] = v;
            }
          }
        });
        ['$in', '$nin'].forEach((op: keyof FilterObject) => {
          let v = object[op];
          if (Array.isArray(v)) {
            let vv: FilterValue[] = [];
            _.forEach(v, (item) => {
              item = field.parse(item);
              if (item !== null) {
                vv.push(item);
              }
            });
            if (vv.length) {
              filter[op] = vv;
            }
          }
        });
        if (_.size(filter)) {
          // @ts-ignore
          result[path] = filter;
        }
      } else {
        let filter = field.parse(value);
        if (filter !== null) {
          // @ts-ignore
          result[path] = filter;
        }
      }
    });

    return result;
  }

  /**
   * 通过ctx创建过滤器
   * @param {Context} ctx
   * @param {Object} [state]
   */
  static async createFiltersByContext(ctx: Context, state?: ContextState): Promise<Filters> {
    let search;
    let filters;

    if (state && state.search) {
      search = state.search;
    } else {
      search = ctx.state.search;
    }

    if (state && state.filters) {
      filters = state.filters;
    } else {
      filters = ctx.state.filters;
    }

    // @ts-ignore
    let model: typeof ModelType = this;
    filters = model.createFilters(
      (search || ctx.query._search || '').trim(),
      filters || ctx.query
    );
    let { defaultFilters } = model;
    if (defaultFilters) {
      if (typeof defaultFilters === 'function') {
        let f = defaultFilters(ctx);
        if (f && f instanceof Promise) {
          // async defaultFilters
          f = await f;
        }
        defaultFilters = <Filters>f;
      }
      if (defaultFilters) {
        _.assign(filters, defaultFilters);
      }
    }
    return filters;
  }

  /**
   * 分页查询
   * @param {Object} [conditions]
   * @returns {alaska$PaginateQuery}
   */
  static paginate(conditions?: Object): PaginateQuery<ModelType> {
    // @ts-ignore
    let model: typeof ModelType = this;

    // @ts-ignore
    let query: PaginateQuery<ModelType> = model.find(conditions);

    let results: PaginateResult<ModelType> = {
      total: 0,
      page: 1,
      limit: model.defaultLimit || 10,
      totalPage: 0,
      previous: 0,
      next: 0,
      search: '',
      results: []
    };

    query.search = function (keyword: string) {
      let filters = model.createFilters(keyword);
      results.search = keyword;
      return query.where(filters);
    };

    query.page = function (page: number) {
      results.page = page;
      results.previous = page <= 1 ? 0 : page - 1;
      return query;
    };

    let limitFn = query.limit;

    query.limit = function (limit: number) {
      results.limit = limit;
      limitFn.call(query, limit);
      return query;
    };

    let execFn = query.exec;

    // @ts-ignore
    query.exec = function (callback: Function) {
      // 返回 Promise
      return (async () => {
        try {
          query.exec = execFn;
          let skip = (results.page - 1) * results.limit;
          // @ts-ignore
          let res: ModelType[] = await query.skip(skip).limit(results.limit).exec();
          results.results = res;
          if ((res.length || skip === 0) && res.length < results.limit) {
            // 优化，省略count查询
            results.total = skip + res.length;
          } else {
            results.total = await model.countDocuments(query.getQuery());
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

    return query;
  }


  /**
   * 获取数据分页列表高级接口
   * @param {alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static paginateByContext(ctx: Context, state?: ContextState): PaginateQuery<ModelType> {
    // @ts-ignore
    let model: typeof ModelType = this;

    let filtersPromise: Promise<Filters>;
    if (!state || !state.filters) {
      filtersPromise = model.createFiltersByContext(ctx, state);
    }

    state = Object.assign({}, ctx.state, state);

    let query: PaginateQuery<ModelType> = model.paginate(state && state.filters)
      .page(parseInt(state.page || ctx.query._page, 10) || 1)
      .limit(parseInt(state.limit || ctx.query._limit, 10) || model.defaultLimit || 10);

    const scopeKey = state.scope || ctx.query._scope || 'list';
    if (scopeKey && model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    let sort = state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    if (filtersPromise) {
      let execFn = query.exec;
      // @ts-ignore
      query.exec = function (callback?: Function) {
        return filtersPromise.then((filters) => {
          query.where(filters);
          query.exec = execFn;
          return query.exec(callback);
        });
      };
    }

    // TODO: relationships
    // TODO: populations

    return query;
  }

  /**
   * 获取数据列表高级接口
   * @param {alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static listByContext(ctx: Context, state?: ContextState): DocumentQuery<ModelType[], ModelType> {
    // @ts-ignore
    let model: typeof ModelType = this;

    let query = model.find(state && state.filters);

    if (!state || !state.filters) {
      let filtersPromise: Promise<Filters>;
      filtersPromise = model.createFiltersByContext(ctx, state);

      let execFn = query.exec;
      // @ts-ignore
      query.exec = function (callback?: Function) {
        return filtersPromise.then((filters) => {
          query.where(filters);
          query.exec = execFn;
          return query.exec(callback);
        });
      };
    }


    state = Object.assign({}, ctx.state, state);

    const scopeKey = state.scope || ctx.query._scope || 'list';
    if (scopeKey && model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    let sort = state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }
    let limit = parseInt(state.limit || ctx.query._limit) || 0;
    if (limit) {
      query.limit(limit);
    }

    // TODO: relationships
    // TODO: populations
    let populations = [];
    _.forEach(model.populations, (pop) => {
      if (processPopulation(query, pop, model, scopeKey) && pop.populations) {
        populations.push(pop);
      }
    });

    // {
    //   let execFn = query.exec;
    //   // @ts-ignore
    //   query.exec = async function (callback?: Function) {
    //     query.exec = execFn;
    //     let result = await query.exec();
    //     result.forEach((record: any) => {
    //       record.title = 'test';
    //     });
    //     if (callback) callback(null, result);
    //     return result;
    //   };
    // }

    return query;
  }

  /**
   * 获取单条数据高级接口
   * @param {alaska$Context} ctx
   * @param {Object} [state]
   * @returns {mongoose.Query}
   */
  static showByContext(ctx: Context, state?: ContextState): DocumentQuery<ModelType | null, ModelType> {
    // @ts-ignore
    let model: typeof ModelType = this;

    state = _.defaultsDeep({}, state, ctx.state);

    let id = state.id || ctx.params.id;
    if (['count', 'paginate', 'watch'].includes(id) && model._fields._id.type.plain !== String) {
      return null;
    }

    let filters = model.createFilters('', ctx.state.filters || ctx.query);

    let query: DocumentQuery<ModelType, ModelType> = model.findById(id).where(filters);

    let { defaultFilters } = model;
    if (defaultFilters) {
      if (typeof defaultFilters === 'function') {
        // @ts-ignore
        defaultFilters = defaultFilters(ctx);
        // @ts-ignore promise.then
        if (defaultFilters && typeof defaultFilters.then === 'function') {
          // async defaultFilters
          let execFn = query.exec;
          // @ts-ignore 重写 query.exec
          query.exec = function (callback: Function) {
            // @ts-ignore defaultFilters.then 存在
            return defaultFilters.then((filters: any) => {
              query.where(filters);
              query.exec = execFn;
              return query.exec(callback);
            });
          };
        } else {
          query.where(defaultFilters);
        }
      } else {
        query.where(defaultFilters);
      }
    }

    const scopeKey = state.scope || ctx.query._scope || 'show';
    if (model.autoSelect && model.scopes[scopeKey]) {
      //仅仅查询scope指定的字段,优化性能
      query.select(model.scopes[scopeKey]);
    }

    // TODO: relationships
    // TODO: populations
    return query;
  }

  /**
   * 将object数据转为Model对象
   * @param {Object} data
   * @returns {Model}
   */
  static fromObject(data: any): ModelType {
    if (data && data.instanceOfModel) {
      return data;
    }
    // @ts-ignore
    let record: ModelType = new this(null, null, true);
    record.init(data);
    return record;
  }

  /**
   * 将object数据转为Model对象
   * @param {Array} array
   * @returns {Model[]}
   */
  static fromObjectArray(array: any[]): ModelType[] {
    return array.map((data) => this.fromObject(data));
  }

  /**
   * 将模型数组转为plain object数组
   * @param {[Model]} array
   * @returns {[Object]}
   */
  static toObjectArray(array: ModelType[]): any[] {
    return _.map(array, (record) => record.toObject());
  }

  // eslint-disable-next-line
  constructor(doc?: Object | null, fields?: Object | null, skipId?: boolean) {
    throw new Error('Can not new a Model before register.');
  }
}
