"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
class FileFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { value, field } = this.props;
        let el = null;
        if (value) {
            if (typeof value === 'string') {
                value = { url: value };
            }
            if (field.multi) {
                if (value.length) {
                    el = value.length;
                }
            }
            else if (value.url) {
                el = React.createElement("a", { target: "_blank", href: value.url }, tr('Download'));
            }
        }
        return (React.createElement("div", { className: "file-field-cell" }, el));
    }
}
exports.default = FileFieldCell;
