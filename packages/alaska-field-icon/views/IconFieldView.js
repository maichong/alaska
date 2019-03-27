"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
class IconFieldView extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (event) => {
            if (this.props.onChange) {
                this.props.onChange(event.target.value);
            }
        };
    }
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
    }
    render() {
        let { className, field, disabled, value, error } = this.props;
        let { help } = field;
        className += ' icon-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        let icon = null;
        if (value) {
            icon = React.createElement("i", { className: `fa fa-${value}` });
        }
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, icon);
        }
        else {
            inputElement = React.createElement("div", { className: "input-group" },
                React.createElement("input", { type: "text", className: !error ? 'form-control' : 'form-control is-invalid', onChange: this.handleChange, value: value || '', disabled: disabled }),
                React.createElement("div", { className: "input-group-append" },
                    React.createElement("span", { className: "input-group-text" }, icon)));
        }
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
exports.default = IconFieldView;
