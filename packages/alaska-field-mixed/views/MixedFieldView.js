"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const react_codemirror2_1 = require("react-codemirror2");
const _ = require("lodash");
require("codemirror/mode/javascript/javascript");
class MixedFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (editor, data, value) => {
            let state = {
                text: value,
                hasError: false
            };
            try {
                JSON.parse(value);
            }
            catch (error) {
                try {
                    eval(value);
                }
                catch (err) {
                    state.hasError = true;
                }
            }
            console.log('setState', state);
            this.setState(state);
        };
        this.handleBlur = (editor, event) => {
            let value = editor.getValue();
            let json;
            let state = {
                text: value,
                hasError: false
            };
            try {
                json = JSON.parse(value);
            }
            catch (error) {
                try {
                    eval('json=' + value);
                }
                catch (err) {
                    state.hasError = true;
                }
            }
            this.setState(state);
            if (typeof json !== 'undefined' && this.props.onChange) {
                this.props.onChange(json);
            }
        };
        this.state = {
            _value: props.value,
            text: JSON.stringify(props.value, null, 4),
            hasError: false
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.value, prevState._value)) {
            return {
                _value: nextProps.value,
                text: JSON.stringify(nextProps.value, null, 4)
            };
        }
        return null;
    }
    shouldComponentUpdate(props, state) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
            || !shallowEqualWithout(state, this.state);
    }
    render() {
        let { className, field, disabled, error } = this.props;
        let { help } = field;
        let inputError = '';
        className += ' mixed-field ';
        if (error || this.state.hasError) {
            help = error;
            inputError = 'is-invalid';
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let label = field.nolabel ? '' : field.label;
        let inputElement;
        if (disabled || field.fixed) {
            inputElement = React.createElement("pre", null, this.state.text);
        }
        else {
            inputElement = React.createElement(react_codemirror2_1.Controlled, { className: inputError, onBeforeChange: this.handleChange, onBlur: this.handleBlur, value: this.state.text, options: _.defaults({}, field.codeMirrorOptions, {
                    mode: {
                        name: 'javascript',
                        json: true
                    },
                    lineNumbers: true,
                    readOnly: disabled
                }) });
        }
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" },
                    inputElement,
                    helpElement)));
        }
        return (React.createElement("div", { className: className },
            label ? (React.createElement("label", { className: "col-form-label" }, label)) : null,
            inputElement,
            helpElement));
    }
}
exports.default = MixedFieldView;
