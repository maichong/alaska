"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const tooltip_wrapper_1 = require("@samoyed/tooltip-wrapper");
const Node_1 = require("./Node");
class ListSplitTool extends React.Component {
    constructor() {
        super(...arguments);
        this.handleSplit = () => {
            this.props.onChange(!this.props.value);
        };
    }
    render() {
        const { value } = this.props;
        return (React.createElement(Node_1.default, { className: "list-split-tool", wrapper: "ListSplitTool", props: this.props },
            React.createElement(tooltip_wrapper_1.default, { tooltip: tr('Quick Viewer'), placement: "bottom" },
                React.createElement("button", { className: `btn btn-light${value ? ' active' : ''}`, onClick: this.handleSplit },
                    React.createElement("i", { className: "fa fa-pencil-square-o" })))));
    }
}
exports.default = ListSplitTool;
