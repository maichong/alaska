"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const tr = require("grackle");
class GeoFieldView extends React.Component {
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
    }
    render() {
        let { className, field, value, error } = this.props;
        let { help } = field;
        className += ' geo-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (value && value[0]) {
            value = React.createElement("a", { href: `https://uri.amap.com/marker?position=${value[0]},${value[1]}`, target: "_blank", rel: "noopener noreferrer" },
                tr('LNG'),
                ":",
                value[0],
                " ",
                tr('LAT'),
                ":",
                value[1]);
        }
        else {
            value = null;
        }
        inputElement = React.createElement("p", { className: "form-control-plaintext" }, value);
        let label = field.nolabel ? '' : field.label;
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" },
                    inputElement,
                    helpElement)));
        }
        return (React.createElement("div", { className: className },
            label ? React.createElement("label", { className: "col-form-label" }, label) : null,
            inputElement,
            helpElement));
    }
}
exports.default = GeoFieldView;
