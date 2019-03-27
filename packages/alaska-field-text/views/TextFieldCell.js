"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class TextFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { value } = this.props;
        if (!value)
            return null;
        if (value.length > 50) {
            value = `${value.substr(0, 50)}...`;
        }
        return (React.createElement("div", null, value));
    }
}
exports.default = TextFieldCell;
