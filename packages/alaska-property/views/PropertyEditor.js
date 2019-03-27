"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const tr = require("grackle");
const immutable = require("seamless-immutable");
const alaska_admin_view_1 = require("alaska-admin-view");
const queryCaches_1 = require("alaska-admin-view/redux/queryCaches");
const select_1 = require("@samoyed/select");
const checkbox_group_1 = require("@samoyed/checkbox-group");
const switch_1 = require("@samoyed/switch");
function parseProp(prop) {
    let options = [];
    let valueMap = {};
    _.forEach(prop.values, (v) => {
        let value = immutable({ label: v.title, value: v._id });
        options.push(value);
        valueMap[v._id] = v;
    });
    return prop.merge({ options, valueMap });
}
class PropertyEditor extends React.Component {
    constructor(props) {
        super(props);
        this.init = () => {
            if (this.state.props)
                return;
            alaska_admin_view_1.query({
                model: 'alaska-property.Property',
                filters: this.state.filters,
                populations: ['values']
            }).then((res) => {
                let props = res.results.map(parseProp);
                this.setState({
                    props: immutable(props)
                });
            });
        };
        this.handleChange = () => {
            let { props, valueMap } = this.state;
            let value = [];
            _.forEach(props, (p) => {
                let prop = valueMap[p._id];
                if (prop && prop.values.length) {
                    value.push(prop);
                }
            });
            this.props.onChange(immutable(value));
        };
        this.state = {
            valueMap: _.keyBy(props.value, 'id'),
            filters: {}
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { field, record } = nextProps;
        let nextState = {};
        let filters = _.assign({ cats: record.cat }, field.filters);
        if (!_.isEqual(filters, prevState.filters)) {
            nextState = { filters, props: null };
        }
        if (nextProps.value !== prevState._value) {
            nextState._value = nextProps.value;
            if (nextProps.value) {
                nextState.valueMap = _.keyBy(nextProps.value, 'id');
            }
        }
        return nextState;
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    render() {
        const { disabled } = this.props;
        const { props, valueMap } = this.state;
        if (!props) {
            return React.createElement("p", { className: "text-center" }, "Loading...");
        }
        if (!props.length) {
            return React.createElement("p", { className: "text-center" }, tr('No properties found'));
        }
        let me = this;
        let list = _.map(props, (p) => {
            if (!valueMap[p._id]) {
                valueMap[p._id] = immutable({
                    id: p._id,
                    title: p.title,
                    sku: p.sku,
                    filter: p.filter,
                    values: []
                });
            }
            let canCreatePropertyValue = p.sku && alaska_admin_view_1.hasAbility('alaska-property.PropertyValue.create');
            function handleChange(v) {
                if (!p.multi) {
                    v = v ? [v] : [];
                }
                let values = _.map(v, (id) => {
                    let value = p.valueMap[id];
                    return value ? { id, title: value.title } : { title: id };
                });
                valueMap[p._id] = valueMap[p._id].set('values', values);
                me.setState({ valueMap }, me.handleChange);
            }
            async function handleCreate(title) {
                let value = await alaska_admin_view_1.execAction({
                    model: 'alaska-property.PropertyValue',
                    action: 'create',
                    request: title,
                    body: {
                        prop: p._id,
                        title
                    }
                });
                alaska_admin_view_1.store.dispatch(queryCaches_1.clearQueryCache({ model: 'alaska-property.Property' }));
                let newProps = props.flatMap((prop) => {
                    if (prop._id !== p._id)
                        return [prop];
                    prop = prop.set('values', prop.values.concat(value));
                    prop = parseProp(prop);
                    return [prop];
                });
                let values = immutable(valueMap[p._id].values || []);
                values = values.concat({ id: value._id, title: value.title });
                valueMap[p._id] = valueMap[p._id].set('values', values);
                me.setState({ props: newProps, valueMap }, me.handleChange);
            }
            let value = '';
            let values = valueMap[p._id].values;
            if (!p.multi) {
                value = values && values.length ? values[0].id || values[0].title : '';
            }
            else {
                value = _.map(values, (v) => v.id || v.title);
            }
            let helps = [];
            if (p.sku) {
                helps.push(tr('SKU property', 'alaska-porterty'));
            }
            if (p.required) {
                helps.push(tr('Required', 'alaska-porterty'));
            }
            if (p.multi) {
                helps.push(tr('Multipe', 'alaska-porterty'));
            }
            if (p.filter) {
                helps.push(tr('Allow filter', 'alaska-porterty'));
            }
            if (p.input) {
                helps.push(tr('Allow input', 'alaska-porterty'));
            }
            let helpElement = helps.length ? `( ${helps.join(' ')} ) ` : '';
            if (p.help) {
                helpElement += p.help;
            }
            let View = select_1.default;
            if (!p.input && p.checkbox) {
                View = checkbox_group_1.default;
            }
            else if (!p.input && p.switch) {
                View = switch_1.default;
            }
            if (canCreatePropertyValue) {
                View = select_1.default;
            }
            return (React.createElement("div", { className: "form-group", key: p._id },
                React.createElement("label", { className: "control-label col-xs-2" }, p.title),
                React.createElement("div", { className: "col-xs-10" },
                    React.createElement(View, { value: value, multi: p.multi, options: p.options, allowCreate: p.input || canCreatePropertyValue, disabled: disabled, onChange: handleChange, onCreateOption: handleCreate, formatCreateLabel: (str) => tr('CREATE_NEW_PROPERTY_VALUE', { property: p.title, value: str }) }),
                    React.createElement("div", null,
                        React.createElement("small", { className: "form-text text-muted" }, helpElement)))));
        });
        return (React.createElement("div", null, list));
    }
}
exports.default = PropertyEditor;
