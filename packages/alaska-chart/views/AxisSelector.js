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
const alaska_admin_view_1 = require("alaska-admin-view");
const SelectFieldView_1 = require("alaska-field-select/views/SelectFieldView");
class AxisSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: []
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let { record, field } = nextProps;
        let model = alaska_admin_view_1.store.getState().settings.models[record.source];
        if (!model
            || (model === prevState.model && record.keyAxisType === prevState._keyAxisType))
            return null;
        let allowedDataPlains = new Set();
        if (field.path === 'keyAxis') {
            switch (record.keyAxisType) {
                case 'time':
                case 'cycle':
                    allowedDataPlains.add('date');
                    break;
                case 'category':
                    allowedDataPlains.add('string');
                    allowedDataPlains.add('bool');
                    allowedDataPlains.add('objectid');
                case 'value':
                    allowedDataPlains.add('number');
                    break;
            }
        }
        else {
            allowedDataPlains.add('number');
        }
        let options = [];
        _.forEach(model.fields, (fieldItem, path) => {
            if (path === '_id')
                return;
            if (!allowedDataPlains.has(fieldItem.plainName))
                return;
            options.push({
                label: tr(fieldItem.label, model.serviceId),
                value: path
            });
        });
        return {
            _keyAxisType: record.keyAxisType,
            model,
            options
        };
    }
    render() {
        const _a = this.props, { field } = _a, props = __rest(_a, ["field"]);
        const { options } = this.state;
        return (React.createElement(SelectFieldView_1.default, Object.assign({}, props, { field: _.assign({}, field, { options }) })));
    }
}
exports.default = AxisSelector;
