"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const moment = require("moment");
class DatetimeFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let props = this.props;
        let format = props.field.format ? props.field.format : 'YYYY-MM-DD HH:mm:ss';
        if (!props.value) {
            return React.createElement("div", { className: "datetime-field-cell" });
        }
        return (React.createElement("div", { className: "datetime-field-cell" }, moment(props.value).format(format)));
    }
}
exports.default = DatetimeFieldCell;
