"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const checkbox_1 = require("@samoyed/checkbox");
const Node_1 = require("./Node");
const __1 = require("..");
class DataTableRow extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = () => {
            let { record, onSelect, selected } = this.props;
            if (onSelect) {
                onSelect(record, !selected);
            }
        };
        this.handleDoubleClick = () => {
            let { model, record, history } = this.props;
            history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
        };
    }
    render() {
        let { model, columns, record, selected, active, onActive, onSelect, superMode } = this.props;
        let el = React.createElement("tr", { key: `${record._id}-data-table-row`, className: "data-table-row", onClick: () => (onActive ? onActive(record) : ''), onDoubleClick: () => this.handleDoubleClick() },
            React.createElement(Node_1.default, { tag: false, wrapper: "DataTableRow", props: this.props, className: "data-table-row" },
                onSelect ?
                    React.createElement("td", { onClick: (e) => e.stopPropagation() },
                        React.createElement(checkbox_1.default, { value: selected, onChange: this.handleChange }))
                    : null,
                columns.split(' ').map((key) => {
                    let field = model.fields[key];
                    if (!field || field.hidden === true || !field.cell)
                        return null;
                    if (field.super && !superMode)
                        return null;
                    let Cell = __1.views.components[field.cell];
                    return React.createElement("td", { key: key }, Cell ?
                        React.createElement(Cell, { model: model, field: field, value: record[key] })
                        : (record[key] || '').toString());
                }),
                onSelect ?
                    React.createElement("td", { className: "actions" },
                        React.createElement("i", { className: "fa fa-eye text-primary" }))
                    : null));
        if (active && model.preView) {
            let View = __1.views.components[model.preView];
            if (View) {
                let preivew = (React.createElement("tr", { key: `${record._id}-preivew`, className: "preview-line" },
                    React.createElement("td", { colSpan: columns.length + (onSelect ? 2 : 1) },
                        React.createElement(View, { model: model, columns: columns, record: record }))));
                return [el, preivew];
            }
            console.warn(`Missing : ${model.preView}`);
        }
        return el;
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ superMode: settings.superMode }))(DataTableRow);
