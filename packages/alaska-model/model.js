"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const events = require("events");
const mongoose = require("mongoose");
const escape = require("escape-string-regexp");
const alaska_1 = require("alaska");
const data_1 = require("./data");
const utils_1 = require("./utils");
function panic() {
    throw new Error('Can not call the function when Model has been registered.');
}
class Model {
    constructor(doc, fields, skipId) {
        throw new Error('Can not new a Model before register.');
    }
    static lookup(ref) {
        let service = this.service || this.main;
        let model;
        if (ref.indexOf('.') > -1) {
            let [serviceId, modelName] = ref.split('.');
            if (!serviceId) {
                serviceId = service.main.id;
            }
            let serviceModule = service.main.modules.services[serviceId];
            if (!serviceModule || !serviceModule.models)
                return null;
            model = serviceModule.models[modelName] || null;
        }
        else {
            model = service.models[ref];
        }
        if (model && model.classOfModel)
            return model;
        return null;
    }
    static applySettings(settings) {
        let model = this;
        if (settings.virtuals) {
            if (!model.virtuals) {
                model.virtuals = settings.virtuals;
            }
            else {
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
        ['fields', 'groups', 'populations', 'relationships', 'actions'].forEach((key) => {
            if (settings[key]) {
                model[key] = utils_1.deepClone(model[key], settings[key]);
            }
        });
        if (settings.scopes) {
            if (!model.scopes) {
                model.scopes = settings.scopes;
            }
            else {
                _.forEach(settings.scopes, (fields, key) => {
                    if (model.scopes[key]) {
                        model.scopes[key] += ` ${fields}`;
                    }
                    else {
                        model.scopes[key] = fields;
                    }
                });
            }
        }
        ['Register', 'Init', 'Validate', 'Save', 'Remove'].forEach((Action) => {
            let pre = settings[`pre${Action}`];
            if (pre) {
                model.pre(Action.toLowerCase(), pre);
            }
            let post = settings[`post${Action}`];
            if (post) {
                model.post(Action.toLowerCase(), post);
            }
        });
        _.keys(settings).forEach((key) => {
            if ([
                'fields',
                'groups',
                'scopes',
                'populations',
                'relationships',
                'actions',
                'methods',
                'virtuals'
            ].indexOf(key) === -1
                && !/^(pre|post)(Register|Init|Validate|Save|Remove)$/.test(key)) {
                model[key] = settings[key];
            }
        });
    }
    static underscoreMethod(field, name, fn) {
        this._underscore || (this._underscore = {});
        this._underscore[field] || (this._underscore[field] = {});
        this._underscore[field][name] = fn;
    }
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
    static addField(path, options) {
        const model = this;
        const { modelName, service, schema } = model;
        if (options.optional && typeof options.optional === 'string') {
            let dep = alaska_1.Service.lookup(options.optional);
            if (!dep)
                return;
        }
        if (!schema)
            throw new Error('Can not exec Model.addField() before register!');
        if (model._fields.hasOwnProperty(path))
            throw new Error(`Field alread exists [${model.id}.fields.${path}]`);
        options.path = path;
        let orgType = options.type;
        let FieldClass = null;
        if (options.type && typeof options.type === 'object' && options.type.classOfField) {
            FieldClass = options.type;
        }
        else {
            let fieldTypeName = '';
            if (options.type === String) {
                fieldTypeName = 'alaska-field-text';
            }
            else if (options.type === Date) {
                fieldTypeName = 'alaska-field-datetime';
            }
            else if (options.type === Boolean) {
                fieldTypeName = 'alaska-field-checkbox';
            }
            else if (options.type === Object) {
                fieldTypeName = 'alaska-field-mixed';
            }
            else if (options.type === Number) {
                fieldTypeName = 'alaska-field-number';
            }
            else if (typeof options.type === 'string') {
                fieldTypeName = `alaska-field-${options.type}`;
            }
            else if (typeof options.type === 'function' && options.type.classOfModel) {
                fieldTypeName = `alaska-field-subdoc`;
                options.ref = options.type;
            }
            else {
                throw new Error(`Unsupported field type for ${modelName}.${path}`);
            }
            delete options.type;
            _.assign(options, utils_1.loadFieldConfig(service, fieldTypeName));
            if (options.type && typeof options.type === 'string') {
                fieldTypeName = options.type;
            }
            fieldTypeName = fieldTypeName.split(':')[0];
            FieldClass = service.main.modules.libraries[fieldTypeName];
            if (!FieldClass) {
                throw new Error(`Field type '${fieldTypeName}' not found!`);
            }
            options.type = FieldClass;
        }
        options.label = options.label || (path === '_id' ? 'ID' : path.toUpperCase());
        let field = new FieldClass(options, schema, model);
        model._fields[path] = field;
        if (path !== '_id' || orgType !== 'objectid') {
            field.initSchema();
        }
        if (field.protected !== true) {
            model.defaultScope[path] = 1;
        }
    }
    static async register() {
        const model = this;
        const me = this;
        const { modelName, service } = this;
        try {
            if (this._pre && this._pre.register) {
                await collie.compose(this._pre.register, [], this);
                delete this._pre.register;
            }
            if (typeof this.preRegister === 'function') {
                await this.preRegister();
            }
            const collectionName = model.collectionName || ((service.config.get('alaska-model.collectionPrefix') || '') + model.key.replace(/-/g, '_'));
            const schema = new mongoose.Schema({}, Object.assign({}, model.schemaOptions, { collection: collectionName }));
            model.schema = schema;
            schema.set('toJSON', { getters: true, virtuals: false });
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
                        let options = _.clone(model.fields[path]);
                        this.addField(path, options);
                    }
                    catch (e) {
                        console.error(`${model.id}.fields.${path} init failed!`);
                        throw e;
                    }
                });
            }
            try {
                model._virtuals = {};
                if (model.virtuals) {
                    Object.keys(model.virtuals).forEach((path) => {
                        let descriptor = Object.getOwnPropertyDescriptor(model.virtuals, path);
                        if (descriptor.get) {
                            model.defaultScope[path] = 1;
                            schema.virtual(path).get(descriptor.get);
                            model._virtuals[path] = 1;
                        }
                        if (descriptor.set) {
                            schema.virtual(path).set(descriptor.set);
                        }
                    });
                }
            }
            catch (e) {
                console.error(`${model.id} init virtual fields failed!`);
                throw e;
            }
            let needRef = false;
            try {
                let relationships = {};
                if (model.relationships) {
                    _.forEach(model.relationships, (r, key) => {
                        if (r.optional && !service.lookup(r.optional))
                            return;
                        let Ref = r.ref || service.error(`${model.id}.relationships.${key}.ref is undefined`);
                        if (typeof Ref === 'string') {
                            Ref = model.lookup(r.ref);
                            if (!Ref)
                                service.error(`${model.id}.relationships.${key}.ref not found!`);
                        }
                        r.key = key;
                        r.ref = Ref;
                        if (!r.protected) {
                            model.defaultScope[key] = 1;
                        }
                        if (_.size(r.populations)) {
                            needRef = true;
                        }
                        relationships[key] = r;
                    });
                }
                model.relationships = relationships;
            }
            catch (e) {
                console.error(`${model.id} init relationships failed!`);
                throw e;
            }
            try {
                let populations = {};
                _.forEach(model.populations, (p, key) => {
                    if (!p.path && typeof key === 'string') {
                        p.path = key;
                    }
                    let field = model._fields[p.path];
                    if (!field) {
                        if (model.fields[p.path] && model.fields[p.path].optional)
                            return;
                        throw new Error(`${service.id}.${modelName}.populations error, can not populate '${p.path}'`);
                    }
                    p._model = model._fields[p.path].ref;
                    populations[p.path] = p;
                    if (p.select || p.scopes || p.populations) {
                        needRef = true;
                    }
                });
                model.populations = populations;
            }
            catch (e) {
                console.error(`${model.id} init populations failed!`);
                throw e;
            }
            if (needRef) {
                service.pre('start', () => {
                    _.forEach(model.populations, (p) => {
                        utils_1.parsePopulation(p, p._model);
                        if (p.populations && p._model) {
                            _.forEach(p.populations, (item, k) => {
                                utils_1.parsePopulation(item, p._model._fields[k].ref);
                            });
                        }
                    });
                });
            }
            if (model.searchFields) {
                model.searchFields = model.searchFields.split(' ').filter((k) => k && model._fields[k]).join(' ');
            }
            if (model.scopes) {
                if (model.scopes['*']) {
                    model.defaultScope = utils_1.parseFieldList(model.scopes['*'], model);
                }
                _.forEach(model.scopes, (scopeConfig, scopeName) => {
                    if (scopeName === '*')
                        return;
                    model._scopes[scopeName] = utils_1.parseFieldList(scopeConfig, model);
                });
            }
            if (!model._scopes.show) {
                model._scopes.show = model.defaultScope;
            }
            this._pre || (this._pre = {});
            this._post || (this._post = {});
            ['init', 'validate', 'save', 'remove'].forEach((action) => {
                let Action = action[0].toUpperCase() + action.substr(1);
                {
                    let preHooks = this._pre[action] || [];
                    if (model.prototype[`pre${Action}`]) {
                        preHooks.push(model.prototype[`pre${Action}`]);
                        delete model.prototype[`pre${Action}`];
                    }
                    if (preHooks.length) {
                        schema.pre(action, function (next) {
                            try {
                                let doc = this;
                                let promise = collie.compose(preHooks, [], doc);
                                promise.then(() => {
                                    if (action === 'save' && doc.__modifiedPaths) {
                                        doc.__modifiedPaths = doc.modifiedPaths();
                                    }
                                    next();
                                }, (e) => next(e));
                            }
                            catch (error) {
                                next(error);
                            }
                        });
                    }
                    else if (action === 'save') {
                        schema.pre(action, function (next) {
                            let doc = this;
                            try {
                                if (doc.__modifiedPaths) {
                                    doc.__modifiedPaths = doc.modifiedPaths();
                                }
                                next();
                            }
                            catch (error) {
                                next(error);
                            }
                        });
                    }
                    delete this._pre[action];
                }
                {
                    let postHooks = [];
                    if (model.prototype[`post${Action}`]) {
                        postHooks.push(model.prototype[`post${Action}`]);
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
                            }
                            catch (error) {
                                console.error(error.stack);
                            }
                        });
                    }
                    delete this._post[action];
                }
            });
            schema.virtual('_').get(function () {
                if (!this.__methods) {
                    this.__methods = utils_1.bindMethods(me._underscore || {}, this);
                }
                return this.__methods;
            });
            schema.methods.data = function (scope) {
                let doc = {
                    id: typeof this._id === 'number' ? this._id : this.id
                };
                let fields = model.defaultScope;
                if (scope) {
                    if (typeof scope === 'object') {
                        fields = scope;
                        scope = null;
                    }
                    else if (model._scopes[scope]) {
                        fields = model._scopes[scope];
                    }
                }
                _.forEach(fields, (any, key) => {
                    if (key[0] === '_')
                        return;
                    if (!model._virtuals[key]) {
                        if (model._fields[key] && (model._fields[key].protected === true || model._fields[key].private === true || !this.isSelected(key)))
                            return;
                        if (!model._fields[key] && (!model.relationships[key] || model.relationships[key].protected))
                            return;
                    }
                    if (fields[`_${key}`])
                        return;
                    if (this._[key] && this._[key].data) {
                        doc[key] = this._[key].data();
                    }
                    else {
                        let value = this[key];
                        if (value && typeof value === 'object') {
                            let p = model.populations[key];
                            let _fields = value.___fields;
                            if (!_fields && p) {
                                if (p.scopes && typeof scope === 'string' && p.scopes[scope]) {
                                    _fields = p._scopes[scope];
                                }
                                else if (p.select) {
                                    _fields = p._select;
                                }
                            }
                            doc[key] = data_1.objectToData(value, _fields);
                        }
                        else if (typeof value === 'undefined') {
                            let fieldConfig = model._fields[key];
                            if (fieldConfig && typeof fieldConfig.defaultValue !== 'undefined') {
                                doc[key] = fieldConfig.defaultValue;
                            }
                        }
                        else {
                            doc[key] = value;
                        }
                    }
                });
                Object.setPrototypeOf(doc, data_1.Data);
                doc.getRecord = () => this;
                return doc;
            };
            Object.getOwnPropertyNames(model.prototype).forEach((key) => {
                if (key === 'constructor')
                    return;
                schema.methods[key] = model.prototype[key];
                delete model.prototype[key];
            });
            [
                'lookup',
                'classOfModel',
                'addField',
                'paginateByContext',
                'listByContext',
                'showByContext',
                'createFilters',
                'createFiltersByContext',
                'paginate',
                'getWatcher',
            ].forEach((key) => {
                model[key] = Model[key];
            });
            model.applySettings = () => {
                throw new Error('Can not apply model settings after initialized');
            };
            let db = model.db || service.db;
            if (!db) {
                let dbConfig = service.config.get('alaska-model.mongodb', null, true);
                if (!dbConfig || !dbConfig.uri)
                    throw new Error('Missing database configure [alaska-model.mongodb.uri]');
                service.debug(`Connecting ${dbConfig.uri}`);
                db = await mongoose.createConnection(dbConfig.uri, _.assign({
                    poolSize: 10,
                    autoReconnect: true,
                    useCreateIndex: true,
                    useNewUrlParser: true
                }, dbConfig.options));
                service.db = db;
            }
            await db.createCollection(collectionName);
            let MongooseModel = db.model(modelName, schema);
            model.MongooseModel = MongooseModel;
            model.collection = MongooseModel.collection;
            Object.setPrototypeOf(model, MongooseModel);
            Object.setPrototypeOf(model.prototype, MongooseModel.prototype);
            if (typeof this.postRegister === 'function') {
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
            this.registered = true;
        }
        catch (e) {
            console.error(`${model.id}.register failed!`);
            throw e;
        }
    }
    static createFilters(search, filters) {
        let result = {};
        let model = this;
        if (search && model.searchFields) {
            let searchFilters = [];
            let exp;
            let keywords = search.split(' ');
            if (keywords.length > 1) {
                exp = new RegExp(_.map(keywords, (keyword) => escape(keyword)).join('|'), 'i');
            }
            else {
                exp = new RegExp(escape(search), 'i');
            }
            _.forEach(model.searchFields.split(' '), (key) => {
                searchFilters.push({
                    [key]: exp
                });
            });
            if (searchFilters.length > 1) {
                result = {
                    $or: searchFilters
                };
            }
            else {
                result = searchFilters[0];
            }
        }
        _.forEach(filters, (value, path) => {
            if (path === 'id')
                path = '_id';
            let field = model._fields[path];
            if (!field)
                return;
            if (value instanceof RegExp) {
                result[path] = value;
            }
            else if (_.isPlainObject(value)) {
                let object = value;
                let filter = {};
                if (object.$regex) {
                    result[path] = new RegExp(escape(object.$regex), 'i');
                    return;
                }
                ['$gt', '$gte', '$ne', '$eq', '$lt', '$lte'].forEach((op) => {
                    let v = object[op];
                    if (typeof v !== 'undefined') {
                        v = field.parse(v);
                        if (v !== null) {
                            filter[op] = v;
                        }
                    }
                });
                ['$in', '$nin'].forEach((op) => {
                    let v = object[op];
                    if (Array.isArray(v)) {
                        let vv = [];
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
                    result[path] = filter;
                }
            }
            else {
                let filter = field.parseFilter(value);
                if (filter !== null) {
                    result[path] = filter;
                }
            }
        });
        return result;
    }
    static async createFiltersByContext(ctx, state) {
        let search;
        let filters;
        if (state && state.search) {
            search = state.search;
        }
        else {
            search = ctx.state.search;
        }
        if (state && state.filters) {
            filters = state.filters;
        }
        else {
            filters = ctx.state.filters;
        }
        let model = this;
        filters = model.createFilters((search || ctx.query._search || '').trim(), filters || ctx.query);
        let { defaultFilters } = model;
        if (defaultFilters) {
            if (typeof defaultFilters === 'function') {
                let f = defaultFilters(ctx, filters);
                if (f && f instanceof Promise) {
                    f = await f;
                }
                defaultFilters = f;
            }
            if (defaultFilters) {
                _.assign(filters, defaultFilters);
            }
        }
        return filters;
    }
    static paginate(conditions) {
        let model = this;
        let query = model.find(conditions);
        let results = {
            total: 0,
            page: 1,
            limit: model.defaultLimit || 10,
            totalPage: 0,
            previous: 0,
            next: 0,
            search: '',
            results: []
        };
        query.search = function (keyword) {
            let filters = model.createFilters(keyword);
            results.search = keyword;
            return query.where(filters);
        };
        query.page = function (page) {
            results.page = page;
            results.previous = page <= 1 ? 0 : page - 1;
            return query;
        };
        let limitFn = query.limit;
        query.limit = function (limit) {
            results.limit = limit;
            limitFn.call(query, limit);
            return query;
        };
        let execFn = query.exec;
        query.exec = function (callback) {
            return (async () => {
                try {
                    query.exec = execFn;
                    let skip = (results.page - 1) * results.limit;
                    let res = await query.skip(skip).limit(results.limit).exec();
                    results.results = res;
                    if ((res.length || skip === 0) && res.length < results.limit) {
                        results.total = skip + res.length;
                    }
                    else {
                        results.total = await model.countDocuments(query.getQuery());
                    }
                    results.totalPage = Math.ceil(results.total / results.limit);
                    results.next = results.totalPage > results.page ? results.page + 1 : 0;
                    if (callback)
                        callback(null, results);
                    return results;
                }
                catch (error) {
                    if (callback)
                        callback(error);
                    throw error;
                }
            })();
        };
        return query;
    }
    static paginateByContext(ctx, state) {
        let model = this;
        let filtersPromise;
        if (!state || !state.filters) {
            filtersPromise = model.createFiltersByContext(ctx, state);
        }
        state = Object.assign({}, ctx.state, state);
        let query = model.paginate(state && state.filters)
            .page(parseInt(state.page || ctx.query._page, 10) || 1)
            .limit(parseInt(state.limit || ctx.query._limit, 10) || model.defaultLimit || 10);
        const scopeKey = state.scope || ctx.query._scope || 'list';
        if (scopeKey && model.autoSelect && model.scopes[scopeKey]) {
            query.select(model.scopes[scopeKey]);
        }
        let sort = state.sort || ctx.query._sort || model.defaultSort;
        if (sort) {
            query.sort(sort);
        }
        if (filtersPromise) {
            let execFn = query.exec;
            query.exec = function (callback) {
                return filtersPromise.then((filters) => {
                    query.where(filters);
                    query.exec = execFn;
                    return query.exec(callback);
                });
            };
        }
        let populations = [];
        _.forEach(model.populations, (pop) => {
            if (utils_1.processPopulation(query, pop, model, scopeKey) && pop.populations) {
                populations.push(pop);
            }
        });
        return query;
    }
    static listByContext(ctx, state) {
        let model = this;
        let query = model.find(state && state.filters);
        if (!state || !state.filters) {
            let filtersPromise;
            filtersPromise = model.createFiltersByContext(ctx, state);
            let execFn = query.exec;
            query.exec = function (callback) {
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
            query.select(model.scopes[scopeKey]);
        }
        let sort = state.sort || ctx.query._sort || model.defaultSort;
        if (sort) {
            query.sort(sort);
        }
        let limit = parseInt(state.limit || ctx.query._limit) || model.listLimit;
        if (limit) {
            query.limit(limit);
        }
        let populations = [];
        _.forEach(model.populations, (pop) => {
            if (utils_1.processPopulation(query, pop, model, scopeKey) && pop.populations) {
                populations.push(pop);
            }
        });
        return query;
    }
    static showByContext(ctx, state) {
        let model = this;
        state = _.defaultsDeep({}, state, ctx.state);
        let id = state.id || ctx.params.id;
        if (['count', 'paginate', 'watch'].includes(id) && model._fields._id.type.plain !== String) {
            return null;
        }
        let filters = model.createFilters('', ctx.state.filters || ctx.query);
        let query = model.findById(id);
        let { defaultFilters } = model;
        if (defaultFilters) {
            if (typeof defaultFilters === 'function') {
                defaultFilters = defaultFilters(ctx, filters);
                if (defaultFilters && typeof defaultFilters.then === 'function') {
                    let execFn = query.exec;
                    query.exec = function (callback) {
                        return defaultFilters.then((f) => {
                            query.where(filters);
                            query.where(f);
                            query.exec = execFn;
                            return query.exec(callback);
                        });
                    };
                }
                else {
                    query.where(filters);
                    query.where(defaultFilters);
                }
            }
            else {
                query.where(filters);
                query.where(defaultFilters);
            }
        }
        const scopeKey = state.scope || ctx.query._scope || 'show';
        if (model.autoSelect && model.scopes[scopeKey]) {
            query.select(model.scopes[scopeKey]);
        }
        let populations = [];
        _.forEach(model.populations, (pop) => {
            if (utils_1.processPopulation(query, pop, model, scopeKey) && pop.populations) {
                populations.push(pop);
            }
        });
        return query;
    }
    static getWatcher(filters) {
        if (!this._watchers) {
            this._watchers = [];
        }
        filters = filters || {};
        let item = _.find(this._watchers, (w) => _.isEqual(w.filters, filters));
        if (item)
            return item.watcher;
        const model = this;
        let watcher = new events.EventEmitter();
        this._watchers.push({ filters, watcher });
        function watch() {
            let changeStream = model.watch([{ $match: utils_1.filtersToMatch(filters) }], {
                fullDocument: 'updateLookup'
            });
            changeStream.on('change', async (change) => {
                let doc = change.fullDocument;
                if (['insert', 'update'].includes(change.operationType) && doc) {
                    let record = model.hydrate(doc);
                    watcher.emit('change', record);
                }
            });
            changeStream.on('close', () => {
                setTimeout(watch, 100);
            });
        }
        if (model.registered) {
            watch();
        }
        else {
            model.post('register', watch);
        }
        return watcher;
    }
}
Model.classOfModel = true;
Model.registered = false;
exports.default = Model;
