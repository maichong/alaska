import * as _ from 'lodash';
import { ModelFieldList } from 'alaska-model';

/**
 * Data
 */
export const Data = {
  pick(...args: string[]) {
    let { getRecord } = this;
    let data = _.pick(this, ...args) || {};
    Object.setPrototypeOf(data, Data);
    if (getRecord) {
      data.getRecord = getRecord;
    }
    return data;
  },
  omit(...args: string[]) {
    let { getRecord } = this;
    let data = _.omit(this, ...args) || {};
    Object.setPrototypeOf(data, Data);
    if (getRecord) {
      data.getRecord = getRecord;
    }
    return data;
  }
};

export function objectToData(value: any, fields: string | ModelFieldList): any {
  if (!value) {
    return value;
  }
  if (value instanceof Date) {
    // 时间
  } else if (value instanceof Array) {
    // 数组数据
    return value.map((val) => {
      if (val === 'object') {
        return objectToData(val, fields);
      }
      return val;
    });
  } else if (value.data && typeof value.data === 'function') {
    // 如果也有data 函数，判定为document
    value = value.data(fields);
  } else {
    // 无法判断
    // console.log(value);
  }
  return value;
}
