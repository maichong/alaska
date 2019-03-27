"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numeral = require("numeral");
const _ = require("lodash");
exports.count = ({ slice }) => {
    if (!slice.value) {
        slice.value = 0;
    }
    slice.value += 1;
};
exports.sum = ({ record, valueField, slice }) => {
    if (!slice.value) {
        slice.value = 0;
    }
    slice.value += numeral(record.get(valueField)).value() || 0;
};
exports.average = ({ record, valueField, slice, series }) => {
    if (!slice.value) {
        slice.value = 0;
    }
    if (!slice.total) {
        slice.total = 0;
    }
    if (!slice.count) {
        slice.count = 0;
    }
    slice.count += 1;
    let value = numeral(record.get(valueField)).value() || 0;
    if (value) {
        slice.total += value;
    }
    slice.value = _.round(slice.total / slice.count, series.precision);
};
exports.min = ({ record, valueField, slice }) => {
    slice.value = Math.min(slice.value || 0, numeral(record.get(valueField)).value() || 0);
};
exports.max = ({ record, valueField, slice }) => {
    slice.value = Math.max(slice.value || 0, numeral(record.get(valueField)).value() || 0);
};
