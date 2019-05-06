"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const checkbox_1 = require("@samoyed/checkbox");
const Node_1 = require("./Node");
class DataTableHeader extends React.Component {
    constructor() {
        super(...arguments);
        this.handleCheck = () => {
            if (this.props.onSelect) {
                this.props.onSelect();
            }
        };
    }
    render() {
        let { columns, select, sort, model, onSort, onSelect, superMode } = this.props;
        return (React.createElement(Node_1.default, { tag: "thead", wrapper: "DataTableHeader", props: this.props, className: "data-table-header" },
            React.createElement("tr", null,
                onSelect ?
                    React.createElement("th", { scope: "col" },
                        React.createElement(checkbox_1.default, { value: select, onChange: this.handleCheck }))
                    : null,
                columns.split(' ').map((key) => {
                    let sortIcon = null;
                    let handleClick;
                    let field = model.fields[key];
                    if (!field || field.hidden === true || !field.cell)
                        return null;
                    if (field.super && !superMode)
                        return null;
                    if (field && !field.nosort && onSort) {
                        if (field.path === sort) {
                            sortIcon = React.createElement("i", { className: "fa fa-sort-asc m-l-5" });
                            handleClick = () => onSort(`-${field.path}`);
                        }
                        else if (`-${field.path}` === sort) {
                            sortIcon = React.createElement("i", { className: "fa fa-sort-desc m-l-5" });
                            handleClick = () => onSort(field.path);
                        }
                        else {
                            handleClick = () => onSort(`-${field.path}`);
                        }
                    }
                    return (React.createElement("th", { key: key, scope: "col", onClick: handleClick },
                        tr(field ? field.label : key, model.serviceId),
                        sortIcon));
                }),
                React.createElement("th", null))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ superMode: settings.superMode, locale: settings.locale }))(DataTableHeader);
