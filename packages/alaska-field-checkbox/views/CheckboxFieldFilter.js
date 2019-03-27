"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const checkbox_1 = require("@samoyed/checkbox");
function default_1(props) {
    let { className, field, onChange, value } = props;
    return (React.createElement("div", { className: `${className} checkbox-field-filter form-check col-auto` },
        React.createElement(checkbox_1.default, { onChange: (v) => onChange(v || undefined), value: value === true || value === 'true', label: field.label })));
}
exports.default = default_1;
