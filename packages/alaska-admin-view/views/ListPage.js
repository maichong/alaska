"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const immutable = require("seamless-immutable");
const tr = require("grackle");
const qs = require("qs");
const _ = require("lodash");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const Node_1 = require("./Node");
const ListToolbar_1 = require("./ListToolbar");
const FilterEditor_1 = require("./FilterEditor");
const List_1 = require("./List");
const ListActionBar_1 = require("./ListActionBar");
const QuickEditor_1 = require("./QuickEditor");
const LoadingPage_1 = require("./LoadingPage");
const listsRedux = require("../redux/lists");
const __1 = require("..");
const storage_1 = require("../utils/storage");
class ListPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleScroll = () => {
            const ref = this._ref;
            if (!ref)
                return;
            if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 200) {
                const { match, loadMore, settings, lists } = this.props;
                const { params } = match;
                let serviceModels = settings.services[params.service];
                if (serviceModels && serviceModels.models) {
                    let model = serviceModels.models[params.model] || null;
                    let list;
                    if (model) {
                        list = lists[model.id];
                        if (list.next && !list.fetching) {
                            loadMore({ model: model.id });
                        }
                    }
                }
            }
        };
        this.handleSort = (sort) => {
            this.setState({ sort }, () => {
                this.updateQuery();
            });
        };
        this.handleFilters = (filters) => {
            this.setState({ filters }, () => {
                this.updateQuery();
            });
        };
        this.handleSplit = (split) => {
            this.setState({ split });
            storage_1.setStorage('split', split);
        };
        this.handleColumns = (columns) => {
            this.setState({ columns }, () => {
                this.updateQuery();
            });
        };
        this.handleSelect = (selected) => {
            let nextState = { selected, activated: null };
            if (selected.length && !this.state.activated) {
                nextState.activated = selected[0];
            }
            this.setState(nextState);
        };
        this.handleActive = (record) => {
            let { selected } = this.state;
            let nextState = {};
            if (!selected.length || (selected.length === 1 && selected[0] !== record)) {
                nextState.selected = immutable([record]);
            }
            nextState.activated = record;
            this.setState(nextState);
        };
        this.state = {
            records: immutable([]),
            activated: null,
            recordTotal: 0,
            model: null,
            selected: immutable([]),
            options: {},
            sort: '',
            filters: {},
            columns: '',
            split: storage_1.getStorage('split')
        };
    }
    componentDidMount() {
        this.init(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.init(nextProps);
    }
    init(props) {
        const { match, lists, settings, user } = props;
        const { params } = match;
        let nextState = {};
        let serviceModels = settings.services[params.service];
        nextState.records = immutable([]);
        nextState.recordTotal = 0;
        let model;
        if (serviceModels && serviceModels.models) {
            model = serviceModels.models[params.model] || null;
            let list;
            if (model) {
                list = lists[model.id];
                if (list) {
                    nextState.records = list.results;
                    nextState.recordTotal = list.total;
                }
            }
            nextState.model = model;
            if (!model || !nextState.records.length) {
                nextState.selected = immutable([]);
                nextState.activated = null;
            }
        }
        let searchString = (props.location.search || '').substr(1);
        let query = qs.parse(searchString) || {};
        let columns = (query._columns || '').replace(/,/g, ' ');
        if (!columns && nextState.model) {
            columns = nextState.model.defaultColumns;
        }
        if (!_.isEqual(columns, this.state.columns)) {
            nextState.columns = columns;
        }
        let sort = query._sort || '';
        if (sort !== this.state.sort) {
            nextState.sort = sort;
        }
        let queryObject = _.omit(query, ['_columns', '_sort']);
        let filters = {};
        let options = {};
        _.mapKeys(queryObject, (v, k) => {
            if (k !== '_search' && k[0] === '_') {
                k = k.substr(1);
                options[k] = v;
                return;
            }
            if ((v === 'SELF' && model && model.fields[k] && model.fields[k].model === 'alaska-user.User')) {
                v = user.id;
            }
            filters[k] = v;
        });
        if (!_.isEqual(options, this.state.options)) {
            nextState.options = options;
        }
        if (!_.isEqual(filters, this.state.filters)) {
            nextState.filters = filters;
        }
        this.setState(nextState);
    }
    updateQuery() {
        let query = {};
        const { model, filters, sort, options, columns } = this.state;
        if (!model)
            return;
        if (sort && sort !== model.defaultSort) {
            query._sort = sort;
        }
        if (columns !== model.defaultColumns) {
            query._columns = columns.replace(/ /g, ',');
        }
        let optionsTemp = {};
        if (options && _.size(options)) {
            optionsTemp = _.mapKeys(options, (v, k) => {
                if (k[0] !== '_') {
                    k = `_${k}`;
                    return k;
                }
                return k;
            });
        }
        _.assign(query, filters, optionsTemp);
        let { pathname } = this.props.location;
        this.props.history.replace({ pathname, search: `?${qs.stringify(query, { encode: false })}` });
    }
    render() {
        const { model, sort, filters, options, columns, selected, split, recordTotal, records, activated } = this.state;
        if (!model) {
            return React.createElement(LoadingPage_1.default, null);
        }
        let className = [
            'page',
            'list-page',
            `${model.serviceId}-${model.id}`,
            model.canCreate ? 'can-create' : 'no-create',
            model.canUpdate ? 'can-update' : 'no-update',
            model.canRemove ? 'can-remove' : 'no-remove',
        ].join(' ');
        let FilterEditorView = FilterEditor_1.default;
        if (model.filterEditorView && __1.views.components.hasOwnProperty(model.filterEditorView)) {
            FilterEditorView = __1.views.components[model.filterEditorView];
        }
        return (React.createElement(Node_1.default, { className: className, wrapper: "ListPage", props: this.props, onScroll: this.handleScroll, domRef: (r) => {
                this._ref = r;
            } },
            React.createElement("div", { className: `page-inner list-page-inner${split ? ' with-editor' : ''}` },
                React.createElement(ListToolbar_1.default, { model: model, onChangeColumns: this.handleColumns, onFilters: this.handleFilters, onSplit: this.handleSplit, filters: filters, options: options, columns: columns, split: split }, options.title ? options.title : (React.createElement("span", null,
                    tr(model.label),
                    " \u00A0",
                    recordTotal ? React.createElement("i", null,
                        recordTotal,
                        "\u00A0",
                        tr('records')) : React.createElement("i", null, tr('No records'))))),
                !options.nofilters && React.createElement(FilterEditorView, { model: model, value: filters, onChange: this.handleFilters }),
                React.createElement(List_1.default, { options: options, model: model, filters: filters, sort: sort, columns: columns, selected: selected, onSort: this.handleSort, onSelect: this.handleSelect, activated: activated, onActive: this.handleActive }),
                React.createElement(ListActionBar_1.default, { model: model, filters: filters, sort: sort, records: records, selected: selected })),
            React.createElement(QuickEditor_1.default, { model: model, hidden: !split, selected: selected, onCannel: () => this.handleSplit(!split) })));
    }
}
exports.default = react_redux_1.connect((state) => ({
    lists: state.lists,
    settings: state.settings,
    user: state.user,
}), (dispatch) => redux_1.bindActionCreators({
    loadMore: listsRedux.loadMore
}, dispatch))(ListPage);
