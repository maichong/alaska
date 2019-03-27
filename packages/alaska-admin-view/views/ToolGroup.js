"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
class ToolGroup extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { className: "tool-group", wrapper: "ToolGroup", props: this.props }, this.props.children));
    }
}
exports.default = ToolGroup;
