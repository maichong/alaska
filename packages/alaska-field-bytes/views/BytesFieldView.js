"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const numeral = require("numeral");
const _ = require("lodash");
const shallowEqualWithout = require("shallow-equal-without");
class BytesFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (event) => {
            let display = event.target.value;
            this.setState({ display });
        };
        this.handleFocus = () => {
            this.setState({ focused: true });
        };
        this.handleBlur = () => {
            let value = this.state.display;
            let unfomarted = numeral(value).value();
            if (_.isNaN(unfomarted)) {
                unfomarted = 0;
            }
            this.setState({ focused: false, display: numeral(unfomarted).format('0,0') });
            if (unfomarted !== this.props.value) {
                if (this.props.onChange) {
                    this.props.onChange(unfomarted);
                }
            }
        };
        this.state = {
            display: numeral(props.value).format('0,0')
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let newState = {};
        if (prevState.focused) {
            newState.display = nextProps.value;
        }
        else {
            newState.display = numeral(nextProps.value || '0').format('0,0');
        }
        return newState;
    }
    shouldComponentUpdate(props, state) {
        return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
            || !shallowEqualWithout(state, this.state);
    }
    render() {
        let { className, field, disabled, error, } = this.props;
        let { focused } = this.state;
        let { help, unit, size, precision } = field;
        className += ' bytes-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let value = numeral(this.state.display).value() || 0;
        let units = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
        let num = value;
        while (num > (size || 0) && units.length > 1) {
            num /= (size || 0);
            units.shift();
        }
        let u = focused ? unit : (units[0] + (unit || ''));
        let display = focused ? value : _.round(num, precision);
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, display);
        }
        else {
            inputElement = (React.createElement("div", { className: "input-group" },
                React.createElement("input", { type: "text", className: !error ? 'form-control' : 'form-control is-invalid', onChange: this.handleChange, onFocus: this.handleFocus, onBlur: this.handleBlur, value: display, disabled: disabled }),
                React.createElement("div", { className: "input-group-append" },
                    React.createElement("span", { className: "input-group-text" }, u))));
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
            label ? (React.createElement("label", { className: "col-form-label" }, label)) : null,
            inputElement,
            helpElement));
    }
}
exports.default = BytesFieldView;
