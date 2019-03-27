"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const immutable = require("seamless-immutable");
const shallowEqualWithout = require("shallow-equal-without");
const MultiLevelSelect_1 = require("./MultiLevelSelect");
const query_1 = require("alaska-admin-view/utils/query");
const tr = require("grackle");
class CategoryFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (index, value) => {
            const { field, onChange, value: propValue } = this.props;
            if (!field.multi) {
                onChange(value);
            }
            else {
                let values = immutable([]);
                if (!Array.isArray(propValue)) {
                    values = values.concat([propValue]);
                }
                else {
                    values = values.concat(propValue);
                }
                if (!values.length) {
                    values = values.concat([value]);
                }
                else {
                    values = values.flatMap((item, idx) => {
                        if (index === idx) {
                            return [value];
                        }
                        return [item];
                    });
                }
                onChange(values);
            }
        };
        this.handleAdd = () => {
            const { onChange, value } = this.props;
            let values = immutable([]);
            if (!Array.isArray(value)) {
                values = values.concat([value]);
            }
            else {
                values = values.concat(value);
            }
            values = values.concat([null]);
            onChange(values);
        };
        this.handleRemove = (index) => {
            const { onChange, value } = this.props;
            onChange(immutable(value).flatMap((v, k) => {
                if (k === index)
                    return [];
                return [v];
            }));
        };
        this.state = {
            filters: {}
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { field, record } = nextProps;
        let filters = _.reduce(field.filters || {}, (res, v, key) => {
            res[key] = v;
            if (_.isString(v) && v[0] === ':') {
                res[key] = record[v.substr(1)];
            }
            return res;
        }, {});
        if (!_.isEqual(filters, prevState.filters)) {
            return { filters, options: null };
        }
        return null;
    }
    shouldComponentUpdate(nextProps, state) {
        return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
            || !shallowEqualWithout(state, this.state);
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        if (this.state.options)
            return;
        let { field } = this.props;
        query_1.default({
            model: field.model,
            filters: _.assign({ _limit: 10000 }, this.state.filters)
        }).then((relation) => {
            let options = _.map(relation.results, (val) => ({
                label: val[field.modelTitleField] || val.title || val._id,
                value: val._id,
                parent: val.parent
            }));
            this.setState({ options: immutable(options) });
        });
    }
    render() {
        let { className, field, value, disabled, error, model } = this.props;
        let { help } = field;
        className += ' category-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.multi) {
            className += ' category-field-multi';
            if (!Array.isArray(value)) {
                value = [value];
            }
            inputElement = _.map(value, (v, index) => (React.createElement(MultiLevelSelect_1.default, { key: index, value: v || '', disabled: disabled, onChange: (val) => this.handleChange(index, val), onRemove: () => this.handleRemove(index), options: this.state.options })));
            if (!disabled) {
                inputElement.push(React.createElement("button", { className: `btn btn-success ${value.length > 0 ? 'mt-2' : ''}`, key: "add", onClick: this.handleAdd },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " ",
                    tr('Add categories', model.serviceId)));
            }
        }
        else {
            inputElement = (React.createElement(MultiLevelSelect_1.default, { value: value || '', disabled: disabled, onChange: (v) => this.handleChange(0, v), options: this.state.options }));
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
exports.default = CategoryFieldView;
