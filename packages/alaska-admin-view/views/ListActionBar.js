"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
const ListActions_1 = require("./ListActions");
const ActionBar_1 = require("./ActionBar");
class ListActionBar extends React.Component {
    render() {
        const { model, filters, records, selected, sort } = this.props;
        return (React.createElement(Node_1.default, { wrapper: "ListActionBar", props: this.props },
            React.createElement(ActionBar_1.default, { className: "" },
                React.createElement(ListActions_1.default, { model: model, filters: filters, records: records, selected: selected, sort: sort }))));
    }
}
exports.default = ListActionBar;
