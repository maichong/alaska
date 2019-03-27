"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const _ = require("lodash");
const utils_1 = require("./utils");
class SelectFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { field, value, model } = this.props;
        let el;
        let cls = 'select-field-cell';
        if (field.multi) {
            let arr = [];
            let valueMap = {};
            _.forEach(value, (v) => {
                valueMap[utils_1.getOptionValue(v)] = true;
            });
            _.forEach(field.options, (opt) => {
                if (valueMap[String(opt.value)]) {
                    let label = tr(opt.label || String(opt.value), model.serviceId);
                    if (arr.length) {
                        arr.push(' , ');
                    }
                    let c;
                    if (opt.color) {
                        c = `text-${opt.color}`;
                    }
                    arr.push(React.createElement("span", { className: c, key: String(opt.value) }, label));
                }
            });
            el = arr;
        }
        else {
            let option = _.find(field.options, (opt) => opt.value === value);
            el = tr(option ? option.label : value, model.serviceId);
            if (option && option.color) {
                cls += ` text-${option.color}`;
            }
        }
        return React.createElement("div", { className: cls }, el);
    }
}
exports.default = SelectFieldCell;
