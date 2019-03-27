"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const DateTime = require("react-datetime");
const _ = require("lodash");
const moment = require("moment");
class DatetimeFieldFilter extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange1 = (date) => {
            let v = date.toISOString();
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
        this.handleChange2 = (date) => {
            let v = date.toISOString();
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
        let value2 = '';
        if (value && typeof value === 'object') {
            value1 = value.$gte;
            value2 = value.$lte;
        }
        let format = options.format;
        if (!format) {
            format = 'YYYY-MM-DD';
            if (options.month) {
                format = 'YYYY-MM';
            }
            else if (options.year) {
                format = 'YYYY';
            }
        }
        let el = React.createElement(React.Fragment, null,
            React.createElement(DateTime, { className: "flex-1", value: value1 && moment(value1).format(format), dateFormat: format, timeFormat: false, onChange: this.handleChange1 }),
            options.range && React.createElement(DateTime, { className: "flex-1", value: value2 && moment(value2).format(format), dateFormat: format, timeFormat: false, onChange: this.handleChange2 }));
        if (!options.nolabel) {
            el = React.createElement("div", { className: "input-group" },
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("div", { className: "input-group-text" }, field.label)),
                el);
        }
        let style = {
            maxWidth: options.maxWidth || '300px'
        };
        if (options.width) {
            style.width = options.width;
        }
        else {
            let col = 3;
            if (options.range) {
                col = 4;
            }
            className += ` col-${options.col || col}`;
        }
        return (React.createElement("div", { style: style, className: `${className} datetime-field-filter ${options.className || ''}` }, el));
    }
}
exports.default = DatetimeFieldFilter;
