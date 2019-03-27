"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const _ = require("lodash");
const select_1 = require("@samoyed/select");
const checkbox_group_1 = require("@samoyed/checkbox-group");
const switch_1 = require("@samoyed/switch");
class SelectFieldFilter extends React.Component {
    tr(options) {
        if (this.props.field.translate === false) {
            return options;
        }
        return _.map(options, (opt) => _.assign({}, opt, { label: tr(opt.label) }));
    }
    render() {
        let { className, field, value, onChange, options } = this.props;
        if (_.size(field.options) < 2)
            return null;
        let style = {
            maxWidth: options.maxWidth || '300px'
        };
        if (options.width) {
            style.width = options.width;
        }
        let viewClassName = 'flex-fill';
        let View = select_1.default;
        let col = '3';
        if (field.checkbox) {
            View = checkbox_group_1.default;
        }
        else if (field.switch) {
            View = switch_1.default;
        }
        if (options.checkbox) {
            View = checkbox_group_1.default;
        }
        else if (options.switch) {
            View = switch_1.default;
        }
        else if (options.select) {
            View = select_1.default;
        }
        if (View === checkbox_group_1.default || View === switch_1.default) {
            col = 'auto';
            delete options.width;
        }
        if (!options.width) {
            className += ` col-${options.col || col}`;
        }
        let el = React.createElement(View, { clearable: true, multi: false, className: viewClassName, options: this.tr(field.options), value: value, onChange: (v) => onChange(v || undefined) });
        if (!options.nolabel) {
            el = React.createElement("div", { className: "input-group" },
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("div", { className: "input-group-text" }, field.label)),
                el);
        }
        return (React.createElement("div", { className: `${className} select-field-filter ${options.className || ''}` }, el));
    }
}
exports.default = SelectFieldFilter;
