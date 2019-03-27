"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const checkbox_1 = require("@samoyed/checkbox");
class CheckboxFieldView extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (checked) => {
            if (this.props.onChange) {
                this.props.onChange(checked);
            }
        };
    }
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
    }
    render() {
        let { field, value, error, disabled, className } = this.props;
        let { help } = field;
        className += ' checkbox-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        if (field.fixed) {
            disabled = true;
        }
        let input = (React.createElement(checkbox_1.default, { label: field.label, value: value, onChange: this.handleChange, disabled: disabled }));
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("div", { className: "offset-sm-2 col-sm-10" },
                    React.createElement("div", null, input),
                    helpElement)));
        }
        return (React.createElement("div", { className: className },
            React.createElement("div", null, input),
            helpElement));
    }
}
exports.default = CheckboxFieldView;
