"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
const MenuToggle_1 = require("./MenuToggle");
const Nav_1 = require("./Nav");
const WidgetGroup_1 = require("./WidgetGroup");
class Header extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { wrapper: "Header", props: this.props, className: "header" },
            React.createElement(MenuToggle_1.default, null),
            React.createElement(Nav_1.default, null),
            React.createElement("div", { className: "flex-fill" }),
            React.createElement(WidgetGroup_1.default, null)));
    }
}
exports.default = Header;
