"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
class BytesFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        const { value, field } = this.props;
        let display = parseInt(value);
        if (display) {
            let { unit, size, precision } = field;
            let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
            while (display > (size || 0) && units.length > 1) {
                display /= (size || 0);
                units.shift();
            }
            display = _.round(display, precision) + units[0] + (unit || '');
        }
        return (React.createElement("div", null, display));
    }
}
exports.default = BytesFieldCell;
