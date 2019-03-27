"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class PasswordFieldCell extends React.Component {
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (React.createElement("div", null, "******"));
    }
}
exports.default = PasswordFieldCell;
