"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const select_1 = require("@samoyed/select");
const _ = require("lodash");
class MultiLevelSelect extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (level, value) => {
            if (!value) {
                let v = this.props.value;
                if (v) {
                    let l = this.state.levels[level - 1];
                    if (l && l.value) {
                        value = l.value;
                    }
                }
            }
            else {
                value = value.value || value;
            }
            if (typeof value === 'undefined') {
                value = null;
            }
            this.props.onChange(value);
        };
        this.state = {};
    }
    static getDerivedStateFromProps(nextProps) {
        let options = _.cloneDeep(nextProps.options);
        let levels = [];
        let optionsMap = {};
        if (!options || !options.length) {
            levels.push({
                options: []
            });
        }
        else {
            _.forEach(options, (o) => {
                optionsMap[o.value] = o;
            });
            _.forEach(options, (o) => {
                if (o.parent && optionsMap[o.parent]) {
                    if (!optionsMap[o.parent].subs) {
                        optionsMap[o.parent].subs = [];
                    }
                    optionsMap[o.parent].subs.push(o);
                }
                else {
                    delete o.parent;
                }
            });
            options = _.filter(options, (o) => !o.parent);
            if (nextProps.value) {
                let value = nextProps.value;
                while (value) {
                    let option = optionsMap[value];
                    if (!option) {
                        break;
                    }
                    levels.unshift({
                        options: _.filter(optionsMap, (o) => o.parent === option.parent),
                        value
                    });
                    value = option.parent;
                }
            }
            if (!levels.length) {
                levels.unshift({
                    options: _.filter(optionsMap, (o) => !o.parent),
                    value: nextProps.value
                });
            }
            else if (nextProps.value) {
                let option = optionsMap[nextProps.value];
                if (option && option.subs && option.subs.length) {
                    levels.push({
                        options: option.subs
                    });
                }
            }
        }
        return { levels, options, optionsMap };
    }
    render() {
        const { disabled, onRemove } = this.props;
        const { levels } = this.state;
        return (React.createElement("div", { className: "row multi-level-select" },
            _.map(levels, (level, index) => (React.createElement("div", { className: "col-sm-4", key: index },
                React.createElement(select_1.default, { clearable: !disabled, disabled: disabled, options: level.options, value: level.value, onChange: (value) => this.handleChange(index, value) })))),
            !disabled && onRemove && React.createElement("button", { className: "btn btn-sm btn-outline-danger", onClick: onRemove },
                React.createElement("i", { className: "fa fa-times" }))));
    }
}
exports.default = MultiLevelSelect;
