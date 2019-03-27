"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const ToolGroup_1 = require("./ToolGroup");
const Node_1 = require("./Node");
const EditorTabs_1 = require("./EditorTabs");
const __1 = require("..");
function EditorToolbar(props) {
    const { children, model, record, tab, onChangeTab } = props;
    const { editorTools } = __1.views;
    let editorToolsViews = _.map(editorTools, (Item, index) => React.createElement(Item, { key: index }));
    return (React.createElement(Node_1.default, { className: "toolbar editor-toolbar", wrapper: "EditorToolBar", props: props },
        React.createElement("div", { className: "toolbar-inner" },
            React.createElement("div", { className: "toolbar-title" }, children),
            model && !_.isEmpty(model.relationships) && record && record.id && React.createElement(EditorTabs_1.default, { model: model, record: record, value: tab, onChange: onChangeTab }),
            React.createElement(ToolGroup_1.default, null, editorToolsViews))));
}
exports.default = EditorToolbar;
