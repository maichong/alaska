"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const classnames = require("classnames");
const Node_1 = require("./Node");
const react_redux_1 = require("react-redux");
const check_ability_1 = require("../utils/check-ability");
const __1 = require("..");
class FieldGroup extends React.Component {
    constructor() {
        super(...arguments);
        this.fieldRefs = {};
    }
    renderFields(disabled) {
        const { props } = this;
        const { fields: propFields, record, model, horizontal, onFieldChange, errors, settings } = props;
        const { serviceId } = model;
        let fields = [];
        _.forEach(propFields, (field) => {
            let fieldClasses = ['form-group', `${model.serviceId}_${model.modelName}-${field.path}-view`];
            if (horizontal)
                fieldClasses.push('row');
            if ((!field.view)
                || check_ability_1.default(field.hidden, record)
                || (!settings.superMode && check_ability_1.default(field.super, record))) {
                delete this.fieldRefs[field.path];
                return;
            }
            let ViewClass = __1.views.components[field.view];
            if (!ViewClass) {
                console.error(`Missing : ${field.view}`);
                ViewClass = __1.views.components.TextFieldView;
            }
            let fieldDisabled = disabled;
            if (!fieldDisabled && field.disabled) {
                fieldDisabled = check_ability_1.default(field.disabled, record);
            }
            let label = tr(field.label, serviceId);
            let help = tr(field.help, serviceId);
            let value = record[field.path];
            let fixed = check_ability_1.default(field.fixed, record);
            if (fixed) {
                fieldClasses.push('fixed');
            }
            if (fieldDisabled) {
                fieldClasses.push('disabled');
            }
            fields.push(React.createElement(ViewClass, {
                key: field.path,
                value,
                ref: (r) => {
                    this.fieldRefs[field.path] = r;
                },
                model,
                record,
                field: _.assign({ horizontal }, field, {
                    help,
                    label,
                    fixed
                }),
                disabled: fieldDisabled,
                locale: settings.locale,
                error: errors && errors[field.path] || null,
                onChange: (v, error) => onFieldChange(field.path, v, error),
                className: fieldClasses.join(' ')
            }));
        });
        if (!fields.length)
            return null;
        return React.createElement(Node_1.default, { className: "field-group-list", wrapper: "FieldGroup", props: this.props }, fields);
    }
    render() {
        const { props } = this;
        const { record, model, horizontal, form, panel, title, path, settings, wrapper, body, full, embedded } = props;
        if (check_ability_1.default(props.hidden, record))
            return '';
        if (!settings.superMode && check_ability_1.default(props.super, record))
            return '';
        function isDisabled() {
            if (record.isNew) {
                if (model.nocreate)
                    return true;
            }
            else {
                if (model.noupdate)
                    return true;
            }
            if (check_ability_1.default(props.disabled, record))
                return true;
            return false;
        }
        let el = this.renderFields(isDisabled());
        if (!el)
            return null;
        if (form !== false) {
            let className = 'field-group-form form';
            if (horizontal) {
                className += ' form-horizontal';
            }
            el = React.createElement("div", { className: className }, el);
        }
        if (panel !== false) {
            let heading = title ? React.createElement("div", { className: "card-heading" }, tr(title)) : null;
            if (body !== false) {
                el = React.createElement("div", { className: classnames('card-body', { full }) }, el);
            }
            el = (React.createElement("div", { className: `${model.serviceId}_${model.modelName}-group-${path}${embedded ? '' : ' card'}` },
                heading,
                el));
        }
        else {
        }
        el = React.createElement(Node_1.default, { wrapper: "FieldGroup", className: classnames('field-group', { embedded }), props: this.props }, el);
        if (wrapper) {
            return React.createElement(Node_1.default, { wrapper: wrapper, props: this.props }, el);
        }
        return el;
    }
}
FieldGroup.defaultProps = {
    horizontal: true
};
exports.default = react_redux_1.connect(({ settings }) => ({ settings }))(FieldGroup);
