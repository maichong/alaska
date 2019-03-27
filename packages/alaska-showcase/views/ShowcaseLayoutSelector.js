"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const classnames = require("classnames");
function createLayout(layout) {
    let columns = layout.split('-').map((cellCount) => _.repeat('0', parseInt(cellCount)));
    let els = columns.map((str, col) => (React.createElement("ul", { key: col }, _.map(str, (z, cell) => React.createElement("li", { key: cell })))));
    return React.createElement("div", { className: "showcase-layout-row" }, els);
}
const layouts = {
    '1': createLayout('1'),
    '1-1': createLayout('1-1'),
    '1-1-1': createLayout('1-1-1'),
    '1-1-1-1': createLayout('1-1-1-1'),
    '1-1-1-1-1': createLayout('1-1-1-1-1'),
    '1-2': createLayout('1-2'),
    '2-1': createLayout('2-1'),
    '2-3': createLayout('2-3'),
    '3-2': createLayout('3-2'),
    '1-1-2': createLayout('1-1-2'),
    '1-1-3': createLayout('1-1-3'),
    '1-2-1': createLayout('1-2-1'),
    '1-2-2': createLayout('1-2-2'),
    '1-2-3': createLayout('1-2-3'),
    '1-3-1': createLayout('1-3-1'),
    '1-3-2': createLayout('1-3-2'),
    '1-3-3': createLayout('1-3-3'),
    '2-1-1': createLayout('2-1-1'),
    '2-1-2': createLayout('2-1-2'),
    '2-1-3': createLayout('2-1-3'),
    '2-2-1': createLayout('2-2-1'),
    '2-2-3': createLayout('2-2-3'),
    '2-3-1': createLayout('2-3-1'),
    '2-3-2': createLayout('2-3-2'),
    '2-3-3': createLayout('2-3-3'),
    '3-1-1': createLayout('3-1-1'),
    '3-1-2': createLayout('3-1-2'),
    '3-1-3': createLayout('3-1-3'),
    '3-2-1': createLayout('3-2-1'),
    '3-2-2': createLayout('3-2-2'),
    '3-2-3': createLayout('3-2-3'),
    '3-3-1': createLayout('3-3-1'),
    '3-3-2': createLayout('3-3-2'),
};
class ShowcaseLayoutSelector extends React.Component {
    render() {
        let { className, field, disabled, value, onChange } = this.props;
        className += ' showcase-layout-field';
        let label = field.nolabel ? '' : field.label;
        let inputElement;
        if (field.fixed) {
            inputElement = React.createElement("div", { className: "showcase-layout-item" }, layouts[value]);
        }
        else {
            inputElement = _.map(layouts, (layout, key) => {
                return (React.createElement("div", { key: key, className: classnames('showcase-layout-item', { active: value === key }), onClick: disabled ? null : () => onChange(key) }, layout));
            });
        }
        if (field.horizontal) {
            return (React.createElement("div", { className: className },
                React.createElement("label", { className: "col-sm-2 col-form-label" }, label),
                React.createElement("div", { className: "col-sm-10" }, inputElement)));
        }
        return (React.createElement("div", { className: className },
            label ? React.createElement("label", { className: "col-form-label" }, label) : null,
            inputElement));
    }
}
exports.default = ShowcaseLayoutSelector;
