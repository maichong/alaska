"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const classnames_1 = require("classnames");
const Node_1 = require("./Node");
class ActionBar extends React.Component {
    render() {
        const { className } = this.props;
        return (React.createElement(Node_1.default, { wrapper: "ActionBar", props: this.props, className: classnames_1.default('action-bar', className) },
            React.createElement("div", { className: "container-fluid" }, this.props.children)));
    }
}
exports.default = ActionBar;
