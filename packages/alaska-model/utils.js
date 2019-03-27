"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function processPopulation(query, pop, model, scopeKey) {
    if (model._scopes[scopeKey] && !model._scopes[scopeKey][pop.path])
        return null;
    let config = {
        path: pop.path,
        model: pop._model,
        select: pop._select,
        match: pop.filters
    };
    if (pop.autoSelect === false && config.select) {
        config = _.omit(config, 'select');
    }
    else if (pop.autoSelect !== false && pop._scopes && pop._scopes[scopeKey]) {
        config.select = pop._scopes[scopeKey];
    }
    query.populate(config);
    return config;
}
exports.processPopulation = processPopulation;
function parsePopulation(p, model) {
    if (p.select) {
        p._select = parseFieldList(p.select, model);
    }
    p._scopes = {};
    _.forEach(p.scopes, (s, scope) => {
        p._scopes[scope] = parseFieldList(s, model);
    });
}
exports.parsePopulation = parsePopulation;
function parseFieldList(fields, model) {
    if (typeof fields === 'object')
        return fields;
    let keys = {};
    fields.split(' ').map((s) => s.trim()).filter((s) => s).forEach((s) => {
        if (s === '*') {
            Object.keys(model.defaultScope).forEach((f) => {
                keys[f] = 1;
            });
        }
        else if (s[0] === '-') {
            s = s.substr(1);
            if (!model.defaultScope[s] && !model.fields[s]) {
                throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
            }
            delete keys[s];
        }
        else if (s[0] === ':') {
            s = s.substr(1);
            let scope = model._scopes[s];
            if (!scope) {
                throw new Error(`Can not find scope ${model.id}.scopes.${s} when process scopes`);
            }
            if (typeof scope === 'object') {
                Object.assign(keys, scope);
            }
            else {
                throw new Error(`Can not init scope, ${model.id}.scopes.${s} should be Object`);
            }
        }
        else if (s[0] === '_') {
            s = s.substr(1);
            if (!model.fields[s]) {
                throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
            }
            keys[s] = 1;
            keys[`_${s}`] = 1;
        }
        else {
            if (!model.defaultScope[s]
                && !model.fields[s]
                && (!model.virtuals || !Object.getOwnPropertyDescriptor(model.virtuals, s) || !Object.getOwnPropertyDescriptor(model.virtuals, s).get)) {
                throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
            }
            keys[s] = 1;
        }
    });
    return keys;
}
exports.parseFieldList = parseFieldList;
function bindMethods(obj, scope) {
    let result = {};
    return _.keys(obj).reduce((bound, key) => {
        if (typeof obj[key] === 'function') {
            bound[key] = obj[key].bind(scope);
        }
        else if (obj && typeof obj === 'object') {
            bound[key] = bindMethods(obj[key], scope);
        }
        return bound;
    }, result);
}
exports.bindMethods = bindMethods;
function mergeFilters(...filters) {
    let result = {};
    _.forEach(filters, (f) => {
        if (!f || _.isEmpty(f))
            return;
        if (!result) {
            result = f;
            return;
        }
        if (result.$and) {
            result.$and.push(f);
            return;
        }
        if (_.intersection(_.keys(result), _.keys(f)).length) {
            result = {
                $and: [result, f]
            };
        }
        else {
            _.assign(result, f);
        }
    });
    return result;
}
exports.mergeFilters = mergeFilters;
function filtersToMatch(filters) {
    let match = {};
    for (let key of Object.keys(filters)) {
        let nkey = key;
        if (nkey[0] !== '$') {
            nkey = `fullDocument.${key}`;
        }
        let value = filters[key];
        if (_.isPlainObject(value)) {
            value = filtersToMatch(value);
        }
        match[nkey] = value;
    }
    return match;
}
exports.filtersToMatch = filtersToMatch;
function deepClone(target, src) {
    target = target || {};
    _.keys(src).forEach((key) => {
        if (!target[key] || Array.isArray(src[key]) || typeof target[key] !== 'object') {
            target[key] = src[key];
        }
        else {
            target[key] = deepClone(target[key], src[key]);
        }
    });
    return target;
}
exports.deepClone = deepClone;
function getId(record) {
    return String(record && typeof record === 'object' ? (record._id || record) : record);
}
exports.getId = getId;
function isIdEqual(a, b) {
    return getId(a) === getId(b);
}
exports.isIdEqual = isIdEqual;
function loadFieldConfig(service, fieldTypeName) {
    let config = service.config.get(fieldTypeName, undefined, true);
    if (!config) {
        return {};
    }
    if (config.type && config.type !== fieldTypeName) {
        let otherConfig = loadFieldConfig(service, config.type);
        return _.assign({}, config, otherConfig);
    }
    return _.clone(config);
}
exports.loadFieldConfig = loadFieldConfig;
