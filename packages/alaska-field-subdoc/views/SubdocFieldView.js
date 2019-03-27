"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const modal_1 = require("@samoyed/modal");
const alaska_admin_view_1 = require("alaska-admin-view");
const Editor_1 = require("alaska-admin-view/views/Editor");
class SubdocFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (newValue, e) => {
            let { value, field, onChange, error } = this.props;
            let { actived } = this.state;
            if (field.multi) {
                if (!value)
                    value = [];
                if (!_.isArray(value) && _.isObject(value))
                    value = [value];
                value = immutable(value).set(actived, newValue);
                if (e) {
                    error = immutable(error || []).set(actived, e);
                }
                else if (error && error[actived]) {
                    error = error.set(actived, undefined);
                    if (!_.find(error, (x) => !!x)) {
                        error = null;
                    }
                }
                onChange(value, error || null);
            }
            else {
                onChange(newValue, error || null);
            }
        };
        this.handleRemove = async () => {
            let { value, onChange, model, error } = this.props;
            let { actived } = this.state;
            if (!await modal_1.confirm(tr('Confirm to remove the item?', model.serviceId)))
                return;
            value = value.flatMap((item, index) => (index === actived ? [] : [item]));
            if (error) {
                let hasError = false;
                error = immutable.flatMap(error, (v, k) => {
                    if (k === actived)
                        return [];
                    if (v)
                        hasError = true;
                    return [v];
                });
                if (!hasError)
                    error = null;
            }
            if (actived > value.length - 1) {
                this.setState({ actived: value.length - 1 }, () => {
                    onChange(value, error || null);
                });
            }
            else {
                onChange(value, error || null);
            }
        };
        this.handleAdd = () => {
            let { value, onChange, error } = this.props;
            value = immutable(value || []).concat({});
            onChange(value, error || null);
            this.setState({ actived: value.length - 1 });
        };
        this.state = {
            actived: 0
        };
    }
    renderTabs() {
        let { value, field } = this.props;
        let { actived } = this.state;
        let tabs = [];
        let model = alaska_admin_view_1.store.getState().settings.models[field.model];
        _.forEach(value, (item, index) => {
            let title = `#${index + 1}`;
            if (model && model.titleField && item[model.titleField]) {
                title = item[model.titleField];
            }
            tabs.push(React.createElement("li", { key: index, className: actived === index ? 'active' : '', onClick: () => this.setState({ actived: index }) }, title));
        });
        return React.createElement("ul", { className: "subdoc-tabs" }, tabs);
    }
    renderActions() {
        const { value } = this.props;
        const { actived } = this.state;
        return (React.createElement("div", { className: "subdoc-actions" },
            value && value[actived] && React.createElement("i", { className: "fa fa-close text-danger", onClick: this.handleRemove }),
            React.createElement("i", { className: "fa fa-plus-square text-success", onClick: this.handleAdd })));
    }
    render() {
        let { className, disabled, value, field, model, error } = this.props;
        let { actived } = this.state;
        className += ' subdoc-field card';
        let form;
        let refModel = alaska_admin_view_1.store.getState().settings.models[field.model];
        if (field.multi) {
            if (!value)
                value = [];
            if (!_.isArray(value) && _.isObject(value))
                value = [value];
            if (!value.length) {
                form = React.createElement("div", { className: "text-center" },
                    tr('No item', model.serviceId),
                    React.createElement("button", { className: "btn btn-sm btn-success ml-2", onClick: this.handleAdd }, tr('Create', model.serviceId)));
            }
            value = value[actived] || {};
            error = (error || [])[actived] || null;
        }
        if (!form && refModel) {
            form = React.createElement(Editor_1.default, { embedded: true, model: refModel, record: immutable(value), errors: error, onChange: this.handleChange, disabled: disabled });
        }
        return (React.createElement("div", { className: className.replace(' row ', ' ') },
            React.createElement("div", { className: "card-heading row" },
                field.label,
                field.multi && this.renderTabs(),
                field.multi && !disabled && this.renderActions()),
            React.createElement("div", { className: "card-body" }, form)));
    }
}
exports.default = SubdocFieldView;
