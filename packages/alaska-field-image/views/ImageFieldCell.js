"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class ImageFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let { value, field } = this.props;
        let url = '';
        if (value) {
            if (typeof value === 'string') {
                url = value + (field.thumbSuffix || '');
            }
            else {
                url = value.thumbUrl || value.url + (field.thumbSuffix || '');
            }
        }
        if (!url) {
            return React.createElement("div", { className: "image-field-cell" });
        }
        return (React.createElement("div", { className: "image-field-cell" },
            React.createElement("img", { alt: "", src: url })));
    }
}
exports.default = ImageFieldCell;
