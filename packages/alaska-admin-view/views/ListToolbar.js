"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const Node_1 = require("./Node");
const __1 = require("..");
const ToolGroup_1 = require("./ToolGroup");
const ColumnsTool_1 = require("./ColumnsTool");
const ListModeTool_1 = require("./ListModeTool");
const ListSplitTool_1 = require("./ListSplitTool");
class ListToolbar extends React.Component {
    render() {
        const options = this.props.options || {};
        const { listTools } = __1.views;
        let { model, onChangeColumns, onFilters, onSplit, filters, columns, split } = this.props;
        let listToolsViews = _.map(listTools, (Item, index) => React.createElement(Item, { key: index }));
        if (!options.nocolumns) {
            listToolsViews.push(React.createElement(ColumnsTool_1.default, { key: "ColumnsTool", columns: columns, model: model, onChange: onChangeColumns }));
        }
        if (!options.nomodes) {
            listToolsViews.push(React.createElement(ListModeTool_1.default, { key: "ListModeTool", page: "list" }));
        }
        if (!options.noquick) {
            listToolsViews.push(React.createElement(ListSplitTool_1.default, { key: "ListSplitTool", page: "list", value: split, onChange: onSplit }));
        }
        return (React.createElement(Node_1.default, { className: "toolbar list-toolbar", wrapper: "ListToolBar", props: this.props },
            React.createElement("div", { className: "toolbar-inner" },
                React.createElement("div", { className: "toolbar-title" }, this.props.children),
                React.createElement(ToolGroup_1.default, null, listToolsViews))));
    }
}
exports.default = ListToolbar;
