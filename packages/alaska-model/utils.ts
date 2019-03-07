import * as _ from 'lodash';
import { Service } from 'alaska';
import { RecordId, Model, ModelFieldList, Filters, Query, ModelPopulation } from '.';
import * as mongoose from 'mongoose';

/**
 * 查询数据时，处理关联查询配置
 */
export function processPopulation(query: Query<any>, pop: ModelPopulation, model: typeof Model, scopeKey: string): null | mongoose.ModelPopulateOptions {
  // 判断scope是否不需要返回此path
  if (model._scopes[scopeKey] && !model._scopes[scopeKey][pop.path]) return null;
  let config: mongoose.ModelPopulateOptions = {
    path: pop.path,
    // @ts-ignore
    model: pop._model,
    select: pop._select,
    match: pop.filters
  };
  if (pop.autoSelect === false && config.select) {
    config = _.omit(config, 'select');
  } else if (pop.autoSelect !== false && pop._scopes && pop._scopes[scopeKey]) {
    config.select = pop._scopes[scopeKey];
  }
  query.populate(config);
  // @ts-ignore config 中存在 path
  return config;
}

/**
 * 处理 model.populations
 */
export function parsePopulation(p: ModelPopulation, model: typeof Model) {
  if (p.select) {
    p._select = parseFieldList(p.select, model);
  }
  p._scopes = {};
  _.forEach(p.scopes, (s, scope) => {
    p._scopes[scope] = parseFieldList(s, model);
  });
}

/**
 * 将 scope / select 设置的fields字符串列表，整理成Object
 * @param fields
 * @param model
 */
export function parseFieldList(fields: string | ModelFieldList, model: typeof Model): ModelFieldList {
  if (typeof fields === 'object') return fields;
  let keys: ModelFieldList = {};
  fields.split(' ').map((s) => s.trim()).filter((s) => s).forEach((s) => {
    if (s === '*') {
      // 所有字段
      Object.keys(model.defaultScope).forEach((f) => {
        keys[f] = 1;
      });
    } else if (s[0] === '-') {
      // 去除字段
      s = s.substr(1);
      if (!model.defaultScope[s] && !model.fields[s]) {
        throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
      }
      delete keys[s];
    } else if (s[0] === ':') {
      // Scope 引用
      s = s.substr(1);
      let scope = model._scopes[s];
      if (!scope) {
        throw new Error(`Can not find scope ${model.id}.scopes.${s} when process scopes`);
      }
      if (typeof scope === 'object') {
        Object.assign(keys, scope);
      } else {
        throw new Error(`Can not init scope, ${model.id}.scopes.${s} should be Object`);
      }
    } else if (s[0] === '_') {
      // 需要查询数据库，但不返回
      s = s.substr(1);
      if (!model.fields[s]) {
        throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
      }
      keys[s] = 1;
      keys[`_${s}`] = 1;
    } else {
      if (
        !model.defaultScope[s]
        && !model.fields[s]
        && (!model.virtuals || !Object.getOwnPropertyDescriptor(model.virtuals, s) || !Object.getOwnPropertyDescriptor(model.virtuals, s).get)
      ) {
        throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
      }
      keys[s] = 1;
    }
  });
  return keys;
}

export interface BindObject {
  [key: string]: Function | BindObject;
}

/**
 * 递归将obj上所有的方法绑定至scope
 * @param {Object} obj
 * @param {Object} scope
 * @returns {Object}
 */
export function bindMethods(obj: BindObject, scope: Object): BindObject {
  let result: BindObject = {};
  return _.keys(obj).reduce((bound, key) => {
    if (typeof obj[key] === 'function') {
      bound[key] = (<Function>obj[key]).bind(scope);
    } else if (obj && typeof obj === 'object') {
      bound[key] = bindMethods(<BindObject>obj[key], scope);
    }
    return bound;
  }, result);
}

/**
 * 合并多个Filters
 */
export function mergeFilters(...filters: Filters[]): Filters {
  let result: Filters = {};
  _.forEach(filters, (f) => {
    if (!f || _.isEmpty(f)) return;
    if (!result) {
      result = f;
      return;
    }
    // 合并
    if (result.$and) {
      (<Filters[]>result.$and).push(f);
      return;
    }

    if (_.intersection(_.keys(result), _.keys(f)).length) {
      // 有交集
      result = {
        $and: [result, f]
      };
    } else {
      // 没有交集，直接合并
      _.assign(result, f);
    }
  });
  return result;
}

/**
 * 深度克隆对象
 * @param {Object} target 目标对象
 * @param {Object} src 原始对象
 * @returns {Object}
 */
export function deepClone<T extends any>(target: T, src: T): T {
  // @ts-ignore
  target = target || {};
  _.keys(src).forEach((key) => {
    if (!target[key] || Array.isArray(src[key]) || typeof target[key] !== 'object') {
      target[key] = src[key];
    } else {
      target[key] = deepClone(target[key], src[key]);
    }
  });
  return target;
}

/**
 * 获取记录的字符串ID
 * @param {Model|string|RecordId} record
 * @return {string}
 */
export function getId(record: Model | RecordId): string {
  // @ts-ignore object._id
  return String(record && typeof record === 'object' ? (record._id || record) : record);
}

/**
 * 判断两个记录的ID是否相同
 * @param {Model|string|RecordId} a 记录A
 * @param {Model|string|RecordId} b 记录B
 * @return {boolean}
 */
export function isIdEqual(a: Model | RecordId, b: Model | RecordId): boolean {
  return getId(a) === getId(b);
}

/**
 * 递归加载字段配置，支持 type 重定向
 * @param service
 * @param fieldTypeName
 */
export function loadFieldConfig(service: Service, fieldTypeName: string): any {
  // eslint-disable-next-line
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
