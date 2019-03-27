"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const shallowEqualWithout = require("shallow-equal-without");
const tr = require("grackle");
const select_1 = require("@samoyed/select");
const checkbox_group_1 = require("@samoyed/checkbox-group");
const switch_1 = require("@samoyed/switch");
const utils_1 = require("./utils");
function filter(record, options) {
    if (!options || !record || !options.length) {
        return [];
    }
    let res = [];
    _.forEach(options, (opt) => {
        opt.label = tr(opt.label);
        res.push(opt);
    });
    return res;
}
class SelectFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _field: props.field,
            options: filter(props.record, props.field.options)
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let state = {
            _field: nextProps.field
        };
        if (nextProps.field !== prevState._field) {
            state.options = filter(nextProps.record, nextProps.field.options);
        }
        return state;
    }
    shouldComponentUpdate(props, state) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model') || state !== this.state;
    }
    tr(opt) {
        if (this.props.field.translate === false) {
            return opt;
        }
        return Object.assign({}, opt, {
            label: tr(opt.label)
        });
    }
    render() {
        let { className, field, value, disabled, error, onChange } = this.props;
        let View = select_1.default;
        if (field.checkbox) {
            View = checkbox_group_1.default;
        }
        else if (field.switch) {
            View = switch_1.default;
        }
        let { help, multi } = field;
        if (multi) {
            if (!_.isArray(value)) {
                value = [value];
            }
            value = _.filter(value, (v) => typeof v !== 'undefined' && v !== null);
        }
        className += ' select-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            if (field.multi) {
                let elements = [];
                let valueMap = {};
                _.forEach(value, (v) => {
                    valueMap[utils_1.getOptionValue(v)] = true;
                });
                _.forEach(this.state.options, (opt) => {
                    if (valueMap[String(opt.value)]) {
                        elements.push(React.createElement("span", { key: String(opt.value) }, opt.label || opt.value));
                    }
                });
                inputElement = elements;
            }
            else {
                let option = _.find(this.state.options, (opt) => opt.value === value);
                inputElement = option ? option.label : value;
            }
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, inputElement);
        }
        else {
            inputElement = React.createElement(View, { clearable: !disabled && !field.required, value: value, multi: field.multi, disabled: disabled, options: this.state.options, onChange: onChange });
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
exports.default = SelectFieldView;
