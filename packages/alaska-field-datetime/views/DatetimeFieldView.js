"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const DateTime = require("react-datetime");
const moment = require("moment");
class DatetimeFieldView extends React.Component {
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
    }
    render() {
        let { className, value, field, disabled, error, onChange } = this.props;
        let format = field.format ? field.format : 'YYYY-MM-DD HH:mm:ss';
        let dateFormat = field.dateFormat ? field.dateFormat : 'YYYY-MM-DD';
        let timeFormat = field.timeFormat ? field.timeFormat : 'HH:mm:ss';
        let valueString = '';
        if (value) {
            valueString = moment(value).format(format);
        }
        let { help } = field;
        className += ' date-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, valueString);
        }
        else if (disabled) {
            inputElement = React.createElement("input", { type: "text", className: "form-control", disabled: true, value: valueString });
        }
        else {
            inputElement = React.createElement(DateTime, { locale: this.props.locale.toLowerCase(), value: valueString || value, dateFormat: dateFormat, timeFormat: timeFormat, onChange: (v) => {
                    v = v || '';
                    v = v.format ? v.format() : '';
                    onChange(v);
                } });
        }
        let label = field.nolabel ? '' : field.label;
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" },
                    inputElement,
                    helpElement)));
        }
        let labelElement = label ? React.createElement("label", { className: "col-form-label" }, label) : null;
        return (React.createElement("div", { className: className },
            labelElement,
            inputElement,
            helpElement));
    }
}
DatetimeFieldView.defaultProps = {
    locale: 'zh-CN'
};
exports.default = DatetimeFieldView;
