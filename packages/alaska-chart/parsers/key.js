"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const LRU = require("lru-cache");
const cache = new LRU({
    max: 1000,
    maxAge: 1000 * 60
});
const auto = ({ model, record, keyField, results }) => {
    let field = model._fields[keyField];
    let key = record.get(keyField);
    if (typeof key !== 'number' && typeof key !== 'string') {
        key = String(key);
    }
    let slice = results.get(key);
    if (slice)
        return slice;
    if (field && field.type && field.type.fieldName === 'Select' && field.options) {
        if (results.has(key))
            return results.get(key);
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
                cacheData = ref[Ref.titleField || 'title'] || ref.title || ref.displayName || ref.name || key;
                cache.set(cacheKey, cacheData);
                slice.result = [cacheData];
                return resolve(slice);
            }, () => {
                cache.set(cacheKey, key);
                return resolve(slice);
            });
        });
    }
    return key;
};
exports.default = auto;
exports.year = ({ record, keyField }) => {
    return moment(record.get(keyField)).format('YYYY');
};
exports.quarter = ({ record, keyField, series }) => {
    if (series.keyAxisType === 'cycle') {
        return moment(record.get(keyField)).format('[Q]Q');
    }
    return moment(record.get(keyField)).format('[Q]Q YYYY');
};
exports.month = ({ record, keyField, series }) => {
    if (series.keyAxisType === 'cycle') {
        return moment(record.get(keyField)).format('MMMM');
    }
    return moment(record.get(keyField)).format('YYYY-MM');
};
exports.week = ({ record, keyField, series }) => {
    if (series.keyAxisType === 'cycle') {
        return moment(record.get(keyField)).format('dddd');
    }
    return moment(record.get(keyField)).format('YYYY-W');
};
exports.day = ({ record, keyField, series }) => {
    if (series.keyAxisType === 'cycle') {
        return moment(record.get(keyField)).format('D');
    }
    return moment(record.get(keyField)).format('YYYY-MM-DD');
};
exports.hour = ({ record, keyField, series }) => {
    if (series.keyAxisType === 'cycle') {
        return moment(record.get(keyField)).format('HH');
    }
    return moment(record.get(keyField)).format('YYYY-MM-DD HH');
};
