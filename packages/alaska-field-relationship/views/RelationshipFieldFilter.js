"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const select_1 = require("@samoyed/select");
const query_1 = require("alaska-admin-view/utils/query");
const _ = require("lodash");
function getFilters(filters) {
    if (!filters)
        return {};
    return _.reduce(filters, (res, value, key) => {
        if (!_.isString(value) || value[0] !== ':') {
            res[key] = value;
        }
        return res;
    }, {});
}
class RelationshipFieldFilter extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = (keyword) => {
            let { field } = this.props;
            const ref = field.model;
            if (!ref)
                return;
            query_1.default({
                model: field.model,
                search: keyword,
                filters: getFilters(field.filters)
            }).then((res) => {
                let selectOptions = _.map(res.results || [], (val) => ({
                    label: val[field.modelTitleField] || val.title || val._id,
                    value: val._id
                }));
                this.setState({ selectOptions });
            });
        };
        this.state = {
            selectOptions: []
        };
    }
    componentDidMount() {
        this.handleSearch('');
    }
    render() {
        let { className, field, value, options, onChange } = this.props;
        const { selectOptions } = this.state;
        let style = {
            maxWidth: options.maxWidth || '240px'
        };
        if (options.width) {
            style.width = options.width;
        }
        else {
            className += ` col-${options.col || 3}`;
        }
        let el = React.createElement(select_1.default, { className: "flex-1", options: selectOptions, onInputChange: this.handleSearch, value: value, onChange: (v) => onChange(v || undefined) });
        if (!options.nolabel) {
            el = React.createElement("div", { className: "input-group" },
                React.createElement("div", { className: "input-group-prepend" },
                    React.createElement("div", { className: "input-group-text" }, field.label)),
                el);
        }
        return (React.createElement("div", { style: style, className: `${className} relationship-field-filter ${options.className || ''}` }, el));
    }
}
exports.default = RelationshipFieldFilter;
