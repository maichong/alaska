"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const shallowEqualWithout = require("shallow-equal-without");
const select_1 = require("@samoyed/select");
const checkbox_group_1 = require("@samoyed/checkbox-group");
const switch_1 = require("@samoyed/switch");
const query_1 = require("alaska-admin-view/utils/query");
function getOptionValue(opt) {
    if (Array.isArray(opt))
        return '';
    if (opt && typeof opt === 'object')
        return opt.value;
    return opt;
}
class RelationshipFieldView extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = (keyword, callback) => {
            const { field } = this.props;
            const { filters } = this.state;
            if (!field || !field.model)
                return;
            query_1.default({
                model: field.model,
                search: keyword,
                filters: _.assign({}, filters, { _limit: keyword ? 20 : 1000 })
            }).then((relation) => {
                let options = _.map(relation.results, (val) => ({
                    label: val[field.modelTitleField] || val.title || val._id,
                    value: val._id
                }));
                callback(options);
            });
        };
        this.handleChange = (value) => {
            if (this.props.onChange) {
                let val = null;
                if (this.props.field.multi) {
                    let arr = [];
                    if (Array.isArray(value))
                        _.forEach(value, (o) => arr.push(getOptionValue(o)));
                    val = arr;
                }
                else if (value) {
                    val = getOptionValue(value);
                }
                this.props.onChange(val);
            }
        };
        this.state = {
            defaultOptions: [],
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
            return { filters };
        }
        return null;
    }
    shouldComponentUpdate(nextProps, state) {
        return !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'search')
            || !shallowEqualWithout(state, this.state);
    }
    componentDidMount() {
        this.handleSearch('', (defaultOptions) => {
            this.setState({ defaultOptions });
        });
    }
    componentDidUpdate(nextProps, state) {
        if (!_.isEqual(this.state.filters, state.filters)) {
            this.handleSearch('', (defaultOptions) => {
                this.setState({ defaultOptions });
            });
        }
    }
    render() {
        let { className, field, value, disabled, error } = this.props;
        const { defaultOptions } = this.state;
        let { help } = field;
        let viewClassName = 'relationship-select';
        let View = select_1.default;
        let checkbox = field.multi && Array.isArray(value) && value.length > 20;
        if (checkbox || field.checkbox) {
            View = checkbox_group_1.default;
            viewClassName = 'relationship-checkbox';
        }
        else if (field.switch) {
            View = switch_1.default;
            viewClassName = 'relationship-switch';
        }
        className += ' relationship-field';
        if (error) {
            className += ' is-invalid';
            help = error;
        }
        let helpElement = help ? React.createElement("small", { className: error ? 'form-text invalid-feedback' : 'form-text text-muted' }, help) : null;
        let inputElement;
        if (field.fixed) {
            let [refServiceId, refModelName] = field.model.split('.');
            let opts = [];
            if (defaultOptions) {
                if (typeof value === 'string') {
                    value = [value];
                }
                _.forEach(value, (v) => {
                    let opt = _.find(defaultOptions, (o) => o.value === v);
                    opts.push(opt || { value: v, label: v });
                });
            }
            inputElement = React.createElement("p", { className: "form-control-plaintext" }, opts.map((opt) => (React.createElement("a", { key: String(opt.value), href: `#/edit/${refServiceId}/${refModelName}/${String(opt.value)}`, style: { paddingRight: 10 } }, opt.label))));
        }
        else {
            inputElement = (React.createElement(View, { clearable: !disabled && !field.required, className: viewClassName, multi: field.multi || false, value: value, disabled: disabled, onChange: this.handleChange, options: defaultOptions, defaultOptions: defaultOptions, loadOptions: this.handleSearch }));
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
exports.default = RelationshipFieldView;
