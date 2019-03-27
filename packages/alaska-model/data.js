"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.Data = {
    pick(...args) {
        let { getRecord } = this;
        let data = _.pick(this, ...args) || {};
        Object.setPrototypeOf(data, exports.Data);
        if (getRecord) {
            data.getRecord = getRecord;
        }
        return data;
    },
    omit(...args) {
        let { getRecord } = this;
        let data = _.omit(this, ...args) || {};
        Object.setPrototypeOf(data, exports.Data);
        if (getRecord) {
            data.getRecord = getRecord;
        }
        return data;
    }
};
function objectToData(value, fields) {
    if (!value) {
        return value;
    }
    if (value instanceof Date) {
    }
    else if (value instanceof Array) {
        return value.map((val) => {
            if (typeof val === 'object') {
                return objectToData(val, fields);
            }
            return val;
        });
    }
    else if (value.data && typeof value.data === 'function') {
        value = value.data(fields);
    }
    else {
    }
    return value;
}
exports.objectToData = objectToData;
