"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const moment = require("moment");
class DateFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { value, field } = this.props;
        if (!value) {
            return React.createElement("div", { className: "date-field-cell" });
        }
        return (React.createElement("div", { className: "date-field-cell" }, moment(value).format(field.cellFormat || field.format)));
    }
}
exports.default = DateFieldCell;
