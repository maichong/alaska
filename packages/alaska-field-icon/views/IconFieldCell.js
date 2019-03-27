"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class IconFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        const { value } = this.props;
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("i", { className: `fa fa-${value}` });
    }
}
exports.default = IconFieldCell;
