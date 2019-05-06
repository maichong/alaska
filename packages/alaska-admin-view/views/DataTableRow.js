"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const checkbox_1 = require("@samoyed/checkbox");
const redux_1 = require("redux");
const Node_1 = require("./Node");
const ListItemActions_1 = require("./ListItemActions");
const ActionRedux = require("../redux/action");
const refreshRedux = require("../redux/refresh");
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
        this.handleShow = () => {
            let { model, record, history } = this.props;
            history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
        };
        this.handleActive = () => {
            const { onActive, record } = this.props;
            if (onActive) {
                onActive(record);
            }
        };
    }
    render() {
        let { model, columns, record, selected, active, onSelect, superMode, history, actionRequest, refresh } = this.props;
        let el = React.createElement("tr", { key: `${record._id}-data-table-row`, className: "data-table-row", onClick: this.handleActive, onDoubleClick: this.handleShow },
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
                React.createElement("td", { className: "actions" },
                    React.createElement(ListItemActions_1.default, { model: model, record: record, history: history, superMode: superMode, refresh: refresh, actionRequest: actionRequest }))));
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
exports.default = react_redux_1.connect(({ settings }) => ({ superMode: settings.superMode }), (dispatch) => redux_1.bindActionCreators({
    actionRequest: ActionRedux.actionRequest,
    refresh: refreshRedux.refresh,
}, dispatch))(DataTableRow);
