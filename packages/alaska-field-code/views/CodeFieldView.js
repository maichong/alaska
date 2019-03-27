"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const react_codemirror2_1 = require("react-codemirror2");
const _ = require("lodash");
class CodeFieldView extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (editor, data, value) => {
            const { disabled, onChange } = this.props;
            if (!disabled && onChange) {
                onChange(value);
            }
        };
    }
    shouldComponentUpdate(props) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
    }
    render() {
        let { className, field, value, disabled, error } = this.props;
        let { help } = field;
        className += ' code-field';
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
            inputElement = React.createElement(react_codemirror2_1.Controlled, { onBeforeChange: this.handleChange, value: value || '', options: _.defaults({}, field.codeMirrorOptions, {
                    lineNumbers: true,
                    readOnly: disabled
                }) });
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
exports.default = CodeFieldView;
