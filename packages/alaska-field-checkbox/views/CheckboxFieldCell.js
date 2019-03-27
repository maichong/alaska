"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class CheckboxFieldCell extends React.Component {
    render() {
        if (this.props.value) {
            return React.createElement("i", { className: "fa fa-check text-success" });
        }
        return React.createElement("i", { className: "fa fa-times", style: { color: '#aaa' } });
    }
}
exports.default = CheckboxFieldCell;
