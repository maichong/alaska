"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tr = require("grackle");
const _ = require("lodash");
const React = require("react");
const qs = require("qs");
const Node_1 = require("./Node");
const SearchField_1 = require("./SearchField");
const __1 = require("..");
const flex = React.createElement("div", { className: "flex-1" });
class FilterEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (path, v) => {
            this.setState({
                filters: _.assign({}, this.state.filters, { [path]: v })
            });
        };
        this.handleSearch = () => {
            this.props.onChange(this.state.filters);
        };
        this.handleClear = () => {
            let { model, fields } = this.props;
            fields = fields || model.filterFields || '';
            let filters = _.assign({}, this.state.filters);
            _.map(fields.split(' '), (f) => {
                let [prefix] = f.split('?');
                let [path, view = ''] = prefix.split('@');
                if (view === 'search') {
                    delete filters._search;
                    return;
                }
                if (path)
                    delete filters[path];
            });
            this.setState({ filters }, () => {
                this.props.onChange(this.state.filters);
            });
        };
        this.state = {
            filters: {}
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.value, prevState._value)) {
            return {
                _value: nextProps.value,
                filters: nextProps.value
            };
        }
        return null;
    }
    handleClose(path) {
        this.props.onChange(_.omit(this.props.value, path));
    }
    render() {
        let { model, fields } = this.props;
        fields = fields || model.filterFields || '';
        if (!fields)
            return null;
        let filters = this.state.filters || {};
        return (React.createElement(Node_1.default, { className: "filter-editor form-row align-items-center", wrapper: "FilterEditor", props: this.props },
            _.map(fields.split(' '), (f) => {
                let [prefix, queryString] = f.split('?');
                let options = queryString ? qs.parse(queryString) : {};
                _.forEach(options, (v, k) => {
                    if (v === '') {
                        options[k] = true;
                    }
                });
                let [path, view = ''] = prefix.split('@');
                if (view === 'flex') {
                    return flex;
                }
                if (view === 'search') {
                    return React.createElement(SearchField_1.default, { key: "@search", value: filters._search || '', placeholder: tr('Search...'), onChange: (v) => this.handleChange('_search', v), onSearch: this.handleSearch });
                }
                let View;
                let field = model.fields[path];
                if (view && __1.views.components.hasOwnProperty(view)) {
                    View = __1.views.components[view];
                }
                else if (field && field.filter) {
                    View = __1.views.components[field.filter];
                    if (!View) {
                        console.warn(`Missing filter view ${field.filter}`);
                    }
                }
                if (!View)
                    return null;
                let className = `${model.id}-${field.path}-filter field-filter`;
                let fieldCfg;
                if (field) {
                    fieldCfg = _.assign({}, field, {
                        label: tr(field.label, model.serviceId)
                    });
                }
                if (options.width && /^\d+$/.test(options.width)) {
                    options.width += 'px';
                }
                if (options.maxWidth && /^\d+$/.test(options.maxWidth)) {
                    options.maxWidth += 'px';
                }
                return (React.createElement(View, { key: path, className: className, model: model, field: fieldCfg, options: options, value: filters[path], filters: filters, onChange: (v) => this.handleChange(path, v), onSearch: this.handleSearch }));
            }),
            React.createElement("div", { className: "flex-fill text-right filter-btns" },
                React.createElement("button", { className: "btn btn-success filter-btn-search", onClick: this.handleSearch }, tr('Search')),
                React.createElement("button", { className: "btn btn-outline-secondary filter-btn-reset ml-1", onClick: this.handleClear }, tr('Reset')))));
    }
}
exports.default = FilterEditor;
