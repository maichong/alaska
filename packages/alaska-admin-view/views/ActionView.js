"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const classnames = require("classnames");
const tooltip_wrapper_1 = require("@samoyed/tooltip-wrapper");
const check_ability_1 = require("../utils/check-ability");
const __1 = require("..");
class ActionView extends React.Component {
    constructor() {
        super(...arguments);
        this.handleClick = (e) => {
            e.stopPropagation();
            let { onClick, link, record } = this.props;
            if (onClick) {
                onClick();
                return;
            }
            if (link) {
                if (record) {
                    link = link.replace(/\{([a-z0-9_]+)\}/ig, (all, word) => {
                        if (record.hasOwnProperty(word)) {
                            return record[word];
                        }
                        return '';
                    });
                }
                this.props.history.push(link);
            }
        };
    }
    render() {
        let { editor, model, action, record, records, selected, icon } = this.props;
        let disabled = action.disabled && check_ability_1.default(action.disabled, record);
        if (action.view) {
            let View = __1.views.components[action.view];
            if (!View) {
                console.error(`Action view ${action.view} missing`);
                return null;
            }
            return React.createElement(View, {
                editor, model, action, records, selected, record, disabled, icon
            });
        }
        let title;
        if (action.title) {
            title = tr(action.title, model && model.serviceId);
        }
        if (title) {
            title = React.createElement("span", { className: "action-title" }, title);
        }
        let el = null;
        if (icon && action.icon) {
            el = React.createElement("i", { className: `fa fa-${action.icon} text-${action.color || 'primary'}`, onClick: disabled ? null : this.handleClick });
        }
        else {
            el = (React.createElement("button", { onClick: this.handleClick, className: classnames('btn', `btn-${action.color || 'light'}`, {
                    'with-icon': !!action.icon,
                    'with-title': !!title
                }), disabled: disabled, key: action.key },
                action.icon ? React.createElement("i", { className: `action-icon fa fa-${action.icon}` }) : null,
                " ",
                title));
        }
        if (action.tooltip) {
            return (React.createElement(tooltip_wrapper_1.default, { placement: "top", tooltip: tr(action.tooltip) }, el));
        }
        return el;
    }
}
exports.default = ActionView;
