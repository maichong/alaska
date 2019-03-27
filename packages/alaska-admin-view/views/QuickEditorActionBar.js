"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
class QuickEditorActionBar extends React.Component {
    render() {
        const { canEdit, saveText, onCannel, onSave, errors } = this.props;
        return (React.createElement("div", { className: "quick-editor-action-bar" },
            React.createElement("div", { className: "inner" },
                canEdit ? React.createElement("button", { className: "btn btn-primary", disabled: !!errors, onClick: errors ? null : () => onSave() }, tr(saveText)) : null,
                React.createElement("div", { className: "btn btn-light", onClick: () => onCannel() }, tr('Cancel')))));
    }
}
exports.default = QuickEditorActionBar;
