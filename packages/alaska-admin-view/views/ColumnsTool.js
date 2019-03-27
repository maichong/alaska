"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
const tooltip_wrapper_1 = require("@samoyed/tooltip-wrapper");
const Dropdown = require('react-bootstrap/Dropdown');
class ColumnsTool extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = (key) => {
            let { model, columns, onChange } = this.props;
            if (!columns) {
                columns = model.defaultColumns;
            }
            let array = columns.split(' ');
            if (array.indexOf(key) > -1) {
                array = _.without(array, key);
            }
            else {
                array = _.map(model.fields, (field) => {
                    if (field.path === key || array.indexOf(field.path) > -1) {
                        return field.path;
                    }
                    return '';
                }).filter(_.identity);
            }
            onChange(array.join(' '));
        };
        this.state = {
            columnsOpen: false
        };
    }
    render() {
        let { model, columns, superMode } = this.props;
        let { columnsOpen } = this.state;
        let iconEle = React.createElement("i", { className: "fa fa-check" });
        if (!columns.length) {
            columns = model.defaultColumns;
        }
        let items = _.map(model.fields, (field) => {
            if (field.hidden === true || !field.cell)
                return false;
            if (field.super && !superMode)
                return false;
            let icon = columns.indexOf(field.path) > -1 ? iconEle : null;
            return (React.createElement(Dropdown.Item, { key: field.path, className: "with-icon", onClick: () => this.handleSelect(field.path) },
                icon,
                " ",
                tr(field.label, model.serviceId)));
        }).filter(_.identity);
        return (React.createElement(Node_1.default, { className: "cloumns-tool", wrapper: "CloumnsTool", props: this.props },
            React.createElement(Dropdown, { show: columnsOpen, onToggle: (isOpen) => this.setState({ columnsOpen: isOpen }) },
                React.createElement(tooltip_wrapper_1.default, { tooltip: tr('Select columns'), placement: "bottom" },
                    React.createElement(Dropdown.Toggle, { variant: "light", id: "cloumns-tool" },
                        React.createElement("i", { className: "fa fa-columns" }))),
                React.createElement(Dropdown.Menu, null, items))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ superMode: settings.superMode }))(ColumnsTool);
