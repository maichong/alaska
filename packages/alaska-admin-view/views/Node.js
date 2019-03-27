"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const __1 = require("..");
exports.default = (function Node(p) {
    let { tag, children, wrapper, props, domRef } = p, others = __rest(p, ["tag", "children", "wrapper", "props", "domRef"]);
    if (tag !== false) {
        tag = (tag || 'div');
        children = React.createElement(tag, Object.assign({ ref: domRef }, others), children);
    }
    if (wrapper) {
        const wrappers = __1.views.wrappers;
        if (wrappers[wrapper] && wrappers[wrapper].length) {
            children = _.reduce(wrappers[wrapper], (el, Wrapper) => React.createElement(Wrapper, _.assign({}, props), el), children);
        }
    }
    return children;
});
