"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const immutable = require("seamless-immutable");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const LoadingPage_1 = require("./LoadingPage");
const List_1 = require("./List");
const ListActionBar_1 = require("./ListActionBar");
const listsRedux = require("../redux/lists");
class RelationshipPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleScroll = () => {
            const ref = this._ref;
            if (!ref)
                return;
            if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 200) {
                const { loadMore, lists, relationship } = this.props;
                let list = lists[relationship.ref];
                if (list && list.next && !list.fetching) {
                    loadMore({ model: relationship.ref });
                }
            }
        };
        this.handleSort = (sort) => {
            this.setState({ sort });
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
            model: null,
            selected: immutable([]),
            sort: '',
            filters: {},
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { lists, relationship, record, settings } = nextProps;
        let nextState = {};
        let filters = {
            [relationship.path]: record.id
        };
        if (!_.isEqual(filters, prevState.filters)) {
            nextState.filters = filters;
        }
        let model = settings.models[relationship.ref];
        if (model !== prevState.model) {
            nextState.model = model;
            nextState.sort = model.defaultSort;
        }
        let list = lists[relationship.ref];
        if (list) {
            nextState.records = list.results;
        }
        return nextState;
    }
    render() {
        const { model, sort, filters, selected, records, activated } = this.state;
        if (!model) {
            return React.createElement(LoadingPage_1.default, null);
        }
        return (React.createElement("div", null,
            React.createElement(List_1.default, { model: model, filters: filters, sort: sort, selected: selected, onSort: this.handleSort, onSelect: this.handleSelect, activated: activated, onActive: this.handleActive }),
            React.createElement(ListActionBar_1.default, { model: model, filters: filters, sort: sort, records: records, selected: selected })));
    }
}
exports.default = react_redux_1.connect(({ lists, settings }) => ({ lists, settings }), (dispatch) => redux_1.bindActionCreators({
    loadMore: listsRedux.loadMore
}, dispatch))(RelationshipPage);
