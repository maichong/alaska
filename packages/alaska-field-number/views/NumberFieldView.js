"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const numeral = require("numeral");
const shallowEqualWithout = require("shallow-equal-without");
class NumberFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (event) => {
            let display = event.target.value;
            this.setState({ display });
        };
        this.handleFocus = () => {
            this.focused = true;
        };
        this.handleBlur = () => {
            this.focused = false;
            const { field } = this.props;
            let value = this.state.display;
            let unfomarted = numeral(value).value();
            if (_.isNaN(unfomarted)) {
                unfomarted = 0;
            }
            if (typeof field.min === 'number' && field.min > unfomarted) {
                unfomarted = field.min;
            }
            if (typeof field.max === 'number' && field.max < unfomarted) {
                unfomarted = field.max;
            }
            if (field.format) {
                this.setState({ display: numeral(unfomarted).format(field.format) });
            }
            else {
                this.setState({ display: String(unfomarted || '') });
            }
            if (unfomarted !== this.props.value) {
                if (this.props.onChange) {
                    this.props.onChange(unfomarted);
                }
            }
        };
        let { value } = props;
        this.state = {
            display: value
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.value !== prevState._value) {
            if (prevState.focused || !nextProps.field.format) {
                return {
                    _value: nextProps.value,
                    display: nextProps.value
                };
            }
            return {
                _value: nextProps.value,
                display: numeral(nextProps.value).format(nextProps.field.format)
            };
        }
        return null;
    }
    shouldComponentUpdate(props, state) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
            || !shallowEqualWithout(state, this.state);
    }
    render() {
        let { className, field, disabled, value, error, model } = this.props;
        let { help } = field;
        className += ' number-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, value);
        }
        else {
            let placeholder = field.placeholder ? tr(field.placeholder, model.serviceId) : '';
            inputElement = (React.createElement("input", { type: "text", className: !error ? 'form-control' : 'form-control is-invalid', onChange: this.handleChange, onFocus: this.handleFocus, onBlur: this.handleBlur, value: this.state.display || '', disabled: disabled, placeholder: placeholder }));
            let addonAfter = field.addonAfter ?
                React.createElement("div", { className: "input-group-append" },
                    React.createElement("span", { className: "input-group-text" }, tr(field.addonAfter, model.serviceId))) : null;
            let addonBefore = field.addonBefore ?
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("span", { className: "input-group-text" }, tr(field.addonBefore, model.serviceId))) : null;
            if (addonAfter || addonBefore) {
                inputElement = React.createElement("div", { className: "input-group" },
                    addonBefore,
                    inputElement,
                    addonAfter);
            }
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
exports.default = NumberFieldView;
