"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
class NumberFieldFilter extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange1 = (event) => {
            let v = event.target.value;
            let { value, options, onChange } = this.props;
            if (options.range) {
                value = value || {};
                if (typeof value !== 'object')
                    value = {};
                value = _.assign({}, value, { $gte: v });
            }
            else {
                value = v;
            }
            onChange(value);
        };
        this.handleChange2 = (event) => {
            let v = event.target.value;
            let { value, onChange } = this.props;
            value = value || {};
            if (typeof value !== 'object')
                value = {};
            value = _.assign({}, value, { $lte: v });
            onChange(value);
        };
    }
    render() {
        let { className, field, value, options } = this.props;
        let value1 = value;
        let value2;
        if (value && typeof value === 'object') {
            value1 = value.$gte;
            value2 = value.$lte;
        }
        let style = {
            maxWidth: options.maxWidth || '200px'
        };
        if (options.width) {
            style.width = options.width;
        }
        else {
            let col = 2;
            if (options.range) {
                col = 3;
            }
            className += ` col-${options.col || col}`;
        }
        let el = React.createElement(React.Fragment, null,
            React.createElement("input", { type: "text", className: "form-control", onChange: this.handleChange1, value: value1 }),
            options.range && React.createElement("input", { type: "text", className: "form-control", onChange: this.handleChange2, value: value2 }));
        if (!options.nolabel) {
            el = React.createElement("div", { className: "input-group" },
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("div", { className: "input-group-text" }, field.label)),
                el);
        }
        return (React.createElement("div", { style: style, className: `${className} number-field-filter ${options.className || ''}` }, el));
    }
}
exports.default = NumberFieldFilter;
