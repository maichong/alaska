import * as moment from 'moment';
import { KeyParser, Slice } from '..';
import * as LRU from 'lru-cache';

const cache = new LRU({
  max: 1000,
  maxAge: 1000 * 60
});

const auto: KeyParser = ({ model, record, keyField, results }) => {
  let field = model._fields[keyField];
  let key = record.get(keyField);
  if (typeof key !== 'number' && typeof key !== 'string') {
    key = String(key);
  }
  let slice: Slice<any> = results.get(key);
  if (slice) return slice;

  if (field && field.type && field.type.fieldName === 'Select' && field.options) {
    if (results.has(key)) return results.get(key);

    slice = {
      keySort: key,
      key,
      value: null,
      result: []
    };
    results.set(key, slice);

    for (let i of Object.keys(field.options)) {
      let { value, label } = field.options[i];
      if (value === key) {
        slice.result.push(label);
        return slice;
      }
    }
  }

  if (field && field.ref && field.type && (field.type.fieldName === 'Relationship' || field.type.fieldName === 'Category')) {
    let Ref = field.ref;

    slice = {
      keySort: key,
      key,
      value: null,
      result: [key]
    };
    results.set(key, slice);

    let cacheKey = `${model.id}:${key}`;
    let cacheData = cache.get(cacheKey);
    if (cacheData) {
      slice.result = [cacheData];
      return slice;
    }

    return new Promise((resolve) => {
      Ref.findById(key).select(`${Ref.titleField || ''} title displayName name`).then((ref) => {
        // @ts-ignore
        cacheData = ref[Ref.titleField || 'title'] || ref.title || ref.displayName || ref.name || key;
        cache.set(cacheKey, cacheData);
        slice.result = [cacheData];
        return resolve(slice);
      }, () => {
        // error
        cache.set(cacheKey, key);
        return resolve(slice);
      });
    });
  }
  return key;
};

export default auto;

export const year: KeyParser = ({ record, keyField }) => {
  return moment(record.get(keyField)).format('YYYY');
};

export const quarter: KeyParser = ({ record, keyField, series }) => {
  if (series.keyAxisType === 'cycle') {
    return moment(record.get(keyField)).format('[Q]Q');
  }
  return moment(record.get(keyField)).format('[Q]Q YYYY');
};

export const month: KeyParser = ({ record, keyField, series }) => {
  if (series.keyAxisType === 'cycle') {
    return moment(record.get(keyField)).format('MMMM');
  }
  return moment(record.get(keyField)).format('YYYY-MM');
};

export const week: KeyParser = ({ record, keyField, series }) => {
  if (series.keyAxisType === 'cycle') {
    // Day of Week
    return moment(record.get(keyField)).format('dddd');
  }
  return moment(record.get(keyField)).format('YYYY-W');
};

export const day: KeyParser = ({ record, keyField, series }) => {
  if (series.keyAxisType === 'cycle') {
    // Day of Month
    return moment(record.get(keyField)).format('D');
  }
  return moment(record.get(keyField)).format('YYYY-MM-DD');
};

export const hour: KeyParser = ({ record, keyField, series }) => {
  if (series.keyAxisType === 'cycle') {
    // HH of Day
    return moment(record.get(keyField)).format('HH');
  }
  return moment(record.get(keyField)).format('YYYY-MM-DD HH');
};
