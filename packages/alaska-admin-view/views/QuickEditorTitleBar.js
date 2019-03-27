"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class QuickEditorTitleBar extends React.Component {
    render() {
        const { title, onCannel } = this.props;
        return (React.createElement("div", { className: "quick-editor-title-bar" },
            title,
            React.createElement("i", { className: "fa fa-close icon-btn", onClick: () => onCannel() })));
    }
}
exports.default = QuickEditorTitleBar;
