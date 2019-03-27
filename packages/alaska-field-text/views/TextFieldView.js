"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const shallowEqualWithout = require("shallow-equal-without");
const tr = require("grackle");
class TextFieldView extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (event) => {
            if (this.props.onChange) {
                this.props.onChange(event.target.value);
            }
        };
    }
    shouldComponentUpdate(nextProps) {
        if (!nextProps.record || !this.props.record)
            return true;
        return nextProps.record._id !== this.props.record._id ||
            !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'model');
    }
    getError() {
        const { field, value } = this.props;
        if (value && field.match && typeof field.match === 'string') {
            let matchs = field.match.match(/^\/(.+)\/([igm]*)$/);
            if (matchs) {
                let match = new RegExp(matchs[1], matchs[2]);
                if (!match.test(value)) {
                    return tr('Invalid format');
                }
            }
        }
        return '';
    }
    render() {
        let { className, field, disabled, value, error, model } = this.props;
        let { help } = field;
        className += ' text-field';
        error = error || this.getError();
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        value = value || '';
        if (disabled && value && field.translate) {
            value = tr(value, model.serviceId);
        }
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, value);
        }
        else {
            let placeholder = field.placeholder ? tr(field.placeholder, field.service || model.serviceId) : '';
            if (field.multiLine) {
                inputElement = (React.createElement("textarea", { className: !error ? 'form-control' : 'form-control is-invalid', placeholder: placeholder, onChange: this.handleChange, disabled: disabled, value: value }));
            }
            else {
                inputElement = (React.createElement("input", { type: "text", className: !error ? 'form-control' : 'form-control is-invalid', placeholder: placeholder, onChange: this.handleChange, value: value, disabled: disabled }));
                let addonAfter = field.addonAfter ?
                    React.createElement("div", { className: "input-group-append" },
                        React.createElement("span", { className: "input-group-text" }, tr(field.addonAfter, field.service || model.serviceId))) : null;
                let addonBefore = field.addonBefore ?
                    React.createElement("div", { className: "input-group-prepend" },
                        React.createElement("span", { className: "input-group-text" }, tr(field.addonBefore, field.service || model.serviceId))) : null;
                if (addonAfter || addonBefore) {
                    inputElement = React.createElement("div", { className: "input-group" },
                        addonBefore,
                        inputElement,
                        addonAfter);
                }
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
exports.default = TextFieldView;
