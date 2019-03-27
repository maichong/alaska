"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const DateTime = require("react-datetime");
const moment = require("moment");
class DateFieldView extends React.Component {
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
    }
    render() {
        let { className, value, field, disabled, error, onChange } = this.props;
        let { help } = field;
        className += ' date-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        if (field.format && value) {
            value = moment(value).format(field.format);
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, value);
        }
        else if (disabled) {
            inputElement = React.createElement("input", { type: "text", className: "form-control", disabled: true, value: value });
        }
        else {
            inputElement = React.createElement(DateTime, { value: value, dateFormat: field.format, timeFormat: false, onChange: onChange });
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
exports.default = DateFieldView;
