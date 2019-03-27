"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const shallowEqualWithout = require("shallow-equal-without");
class PasswordFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleBlur = () => {
            let { value1, value2 } = this.state;
            let newState = {
                errorText: ''
            };
            if (value1 && value1 !== value2) {
                newState.errorText = value2 ? 'The passwords are not match' : 'Please enter the new password again';
            }
            if (value1 && value1 === value2) {
                if (this.props.onChange) {
                    this.props.onChange(value1);
                }
            }
            this.setState(newState);
        };
        this.state = {
            _record: props.record,
            value1: '',
            value2: '',
            errorText: ''
        };
        this.handleChange1 = this.handleChange.bind(this, 1);
        this.handleChange2 = this.handleChange.bind(this, 2);
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let state = {
            _record: nextProps.record
        };
        if (nextProps.record && nextProps.record && nextProps.record._id !== prevState._record._id) {
            state.value1 = '';
            state.value2 = '';
        }
        return state;
    }
    shouldComponentUpdate(nextProps, state) {
        if (!nextProps.record || !this.props.record) {
            return false;
        }
        return nextProps.disabled !== this.props.disabled
            || nextProps.record._id !== this.props.record._id
            || nextProps.value !== this.props.value
            || !this.state.value1
            || !this.state.value2
            || this.state.value1 !== this.state.value2
            || !shallowEqualWithout(state, this.state, '_record');
    }
    getError() {
        const { value1, value2 } = this.state;
        if (value1 !== value2) {
            return tr('The passwords are not match');
        }
        return '';
    }
    handleChange(index, e) {
        let state = {};
        state[(`value${index}`)] = e.target.value;
        this.setState(state);
    }
    render() {
        let { className, field, disabled } = this.props;
        const { state, props } = this;
        className += ' password-field';
        let inputClassName = 'form-control';
        let { help } = field;
        let errorText = state.errorText || props.error;
        if (errorText) {
            className += ' is-invalid';
            help = tr(errorText);
            inputClassName += ' is-invalid';
        }
        let helpElement = help ? React.createElement("small", { className: errorText ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, "******");
        }
        else {
            inputElement = (React.createElement("div", { className: "row" },
                React.createElement("div", { className: "col-sm-4" },
                    React.createElement("input", { className: inputClassName, type: "password", value: state.value1, placeholder: tr('Enter new password'), disabled: disabled, onBlur: this.handleBlur, onChange: this.handleChange1 }),
                    helpElement),
                React.createElement("div", { className: "col-sm-4" },
                    React.createElement("input", { className: inputClassName, type: "password", value: state.value2, placeholder: tr('Repeat password'), disabled: disabled, onBlur: this.handleBlur, onChange: this.handleChange2 }))));
        }
        let label = field.nolabel ? '' : field.label;
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" }, inputElement)));
        }
        return (React.createElement("div", { className: className },
            label ? (React.createElement("label", { className: "col-form-label" }, label)) : null,
            inputElement));
    }
}
exports.default = PasswordFieldView;
