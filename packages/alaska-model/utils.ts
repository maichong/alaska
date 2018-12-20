import * as _ from 'lodash';
import { Service } from 'alaska';
import { Model, ModelFieldList, Filters } from 'alaska-model';

export function processScope(fields: string | ModelFieldList, model: typeof Model): ModelFieldList {
  if (typeof fields === 'object') return fields;
  let keys: ModelFieldList = {};
  fields.split(' ').map((s) => s.trim()).filter((s) => s).forEach((s) => {
    if (s === '*') {
      Object.keys(model.defaultScope).forEach((f) => {
        keys[f] = 1;
      });
    } else if (s[0] === '-') {
      s = s.substr(1);
      if (!model.defaultScope[s] && !model.fields[s]) {
        throw new Error(`Can not find field ${model.id}.scopes.${s} when process scopes`);
      }
      delete keys[s];
    } else if (s[0] === ':') {
      s = s.substr(1);
      let scope = model.scopes[s];
      if (!scope) {
        throw new Error(`Can not find scope ${model.id}.scopes.${s} when process scopes`);
      }
      if (typeof scope === 'object') {
        Object.assign(keys, scope);
      } else {
        throw new Error(`Can not init scope, ${model.id}.scopes.${s} should be Object`);
      }
    } else if (s[0] === '_') {
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
        && (!model.virtuals || !Object.getOwnPropertyDescriptor(model.virtuals, s).get)
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
export function mergeFilters(...filters: Filters[]): Filters | null {
  let result: Filters = null;
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
    if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
      target[key] = src[key];
    } else {
      target[key] = _.defaultsDeep({}, src[key], target[key]);
    }
  });
  return target;
}

/**
 * 获取记录的字符串ID
 * @param {Model|string|any} record
 * @return {string}
 */
export function getId(record: Model | any): string {
  return String(record && typeof record === 'object' ? (record._id || record) : record);
}

/**
 * 判断两个记录的ID是否相同
 * @param {Model|string|any} a 记录A
 * @param {Model|string|any} b 记录B
 * @return {boolean}
 */
export function isIdEqual(a: any, b: any): boolean {
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
