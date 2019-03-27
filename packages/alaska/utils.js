"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function nameToKey(name) {
    return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (`${b}-${c.toLowerCase()}`)).toLowerCase();
}
exports.nameToKey = nameToKey;
function merge(target, patch) {
    if (!_.isPlainObject(patch)) {
        return patch;
    }
    if (!_.isPlainObject(target)) {
        target = {};
    }
    _.forEach(patch, (value, key) => {
        if (value === null) {
            if (target.hasOwnProperty(key)) {
                delete target[key];
            }
        }
        else {
            target[key] = merge(target[key], value);
        }
    });
    return target;
}
exports.merge = merge;
