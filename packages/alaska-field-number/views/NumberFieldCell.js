"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const numeral = require("numeral");
class NumberFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { value, field } = this.props;
        if (field.format) {
            value = numeral(value).format(field.format);
        }
        return (React.createElement("div", { className: "number-field-cell" }, value));
    }
}
exports.default = NumberFieldCell;
