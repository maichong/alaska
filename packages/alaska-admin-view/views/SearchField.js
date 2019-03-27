"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
function SearchField(props) {
    let { value, onChange, onSearch, placeholder } = props;
    return (React.createElement(Node_1.default, { className: "search-field", wrapper: "SearchField", props: props },
        React.createElement("input", { className: "form-control", type: "search", value: value, onChange: (e) => onChange(e.target.value), onKeyPress: (e) => e.key === 'Enter' && onSearch(), placeholder: placeholder })));
}
exports.default = SearchField;
