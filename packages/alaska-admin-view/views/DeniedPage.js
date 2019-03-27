"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const Node_1 = require("./Node");
class DeniedPage extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { wrapper: "Denied", props: this.props, className: "denied" },
            React.createElement("div", { className: "denied-text" }, tr('Access Denied'))));
    }
}
exports.default = DeniedPage;
