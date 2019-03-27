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
const tr = require("grackle");
const SelectFieldView_1 = require("alaska-field-select/views/SelectFieldView");
const alaska_admin_view_1 = require("alaska-admin-view");
class ModelFieldView extends React.Component {
    render() {
        const _a = this.props, { field } = _a, props = __rest(_a, ["field"]);
        let options = _.map(alaska_admin_view_1.store.getState().settings.models, (model) => ({
            label: tr(model.label, model.serviceId),
            value: model.id
        }));
        return (React.createElement(SelectFieldView_1.default, Object.assign({}, props, { field: _.assign({}, field, { options }) })));
    }
}
exports.default = ModelFieldView;
