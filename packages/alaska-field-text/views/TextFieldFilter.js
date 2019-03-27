"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class TextFieldFilter extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (event) => {
            let { onChange, options } = this.props;
            if (options.exact) {
                onChange(event.target.value);
            }
            else {
                onChange({
                    $regex: event.target.value
                });
            }
        };
    }
    render() {
        let { className, field, value, options, onSearch } = this.props;
        if (value && typeof value === 'object') {
            value = value.$regex;
        }
        let style = {
            maxWidth: options.maxWidth || '240px'
        };
        if (options.width) {
            style.width = options.width;
        }
        else {
            className += ` col-${options.col || 2}`;
        }
        let el = React.createElement("input", { type: "text", className: "form-control", value: value, onChange: this.handleChange, onKeyPress: (e) => e.key === 'Enter' && onSearch() });
        if (!options.nolabel) {
            el = React.createElement("div", { className: "input-group" },
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("div", { className: "input-group-text" }, field.label)),
                el);
        }
        return (React.createElement("div", { style: style, className: `${className} text-field-filter ${options.className || ''}` }, el));
    }
}
exports.default = TextFieldFilter;
