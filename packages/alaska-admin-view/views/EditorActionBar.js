"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
const EditorActions_1 = require("./EditorActions");
const ActionBar_1 = require("./ActionBar");
class EditorActionBar extends React.Component {
    render() {
        let { model, record } = this.props;
        return (React.createElement(Node_1.default, { wrapper: "EditorActionBar", props: this.props },
            React.createElement(ActionBar_1.default, { className: "editor-action-bar" }, record ? React.createElement(EditorActions_1.default, { model: model, record: record }) : null)));
    }
}
exports.default = EditorActionBar;
