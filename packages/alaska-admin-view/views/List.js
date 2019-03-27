"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const react_router_dom_1 = require("react-router-dom");
const Node_1 = require("./Node");
const DataTable_1 = require("./DataTable");
const LoadingPage_1 = require("./LoadingPage");
const listsRedux = require("../redux/lists");
class List extends React.Component {
    constructor() {
        super(...arguments);
        this.loadRecords = () => {
            let { filters, sort, model, loadList, list } = this.props;
            if (!model || (list && list.fetching))
                return;
            this.filters = filters;
            this.sort = sort;
            loadList({
                model: model.id,
                page: 1,
                sort: sort,
                filters: _.omit(filters, '_search'),
                search: filters._search
            });
        };
    }
    componentDidMount() {
        this.loadRecords();
    }
    componentDidUpdate() {
        let { filters, sort, list } = this.props;
        if (!list || sort !== this.sort || !_.isEqual(filters, this.filters)) {
            this.loadRecords();
        }
    }
    renderEmpty() {
        const { model, list } = this.props;
        if (!list || list.fetching)
            return null;
        let error = list.error;
        let title = 'No records';
        let desc;
        if (error) {
            title = error.message;
            desc = error.stack;
            if (error.code) {
                desc = `Code: ${error.code} ${desc}`;
            }
        }
        else {
            desc = React.createElement(React.Fragment, null,
                tr('No records found.', model.serviceId),
                "\u00A0\u00A0",
                model.nocreate === true ? null : React.createElement(react_router_dom_1.Link, { to: `/edit/${model.serviceId}/${model.modelName}/_new` }, tr('Create', model.serviceId)));
        }
        return (React.createElement("div", { className: "error-info" },
            React.createElement("div", { className: "error-title" }, tr(title, model.serviceId)),
            React.createElement("div", { className: "error-desc" }, desc)));
    }
    render() {
        const { model, sort, columns, selected, activated, onSort, onSelect, onActive, list } = this.props;
        if (!list || (list.fetching && !list.results.length))
            return React.createElement(LoadingPage_1.default, null);
        if (!list.results.length)
            return this.renderEmpty();
        return (React.createElement(Node_1.default, { className: "list", wrapper: "List", props: this.props },
            React.createElement(DataTable_1.default, { model: model, sort: sort, columns: columns, records: list.results, selected: selected, activated: activated, onActive: onActive, onSort: onSort, onSelect: onSelect })));
    }
}
exports.default = react_redux_1.connect(({ lists }, props) => ({ list: lists[props.model.id] }), (dispatch) => redux_1.bindActionCreators({
    loadList: listsRedux.loadList
}, dispatch))(List);
