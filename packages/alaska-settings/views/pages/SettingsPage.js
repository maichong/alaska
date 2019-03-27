"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const alaska_admin_view_1 = require("alaska-admin-view");
const ActionBar_1 = require("alaska-admin-view/views/ActionBar");
const ActionGroup_1 = require("alaska-admin-view/views/ActionGroup");
const listsRedux = require("alaska-admin-view/redux/lists");
const actionRedux = require("alaska-admin-view/redux/action");
const MODEL_ID = 'alaska-settings.Settings';
class SettingsPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleSave = () => {
            const { values } = this.state;
            if (_.isEmpty(values))
                return;
            let request = Math.random().toString();
            this.request = request;
            this.props.actionRequest({
                action: 'update',
                model: MODEL_ID,
                request,
                records: _.keys(values),
                body: _.map(values, (v, k) => ({ id: k, value: v }))
            });
        };
        this.handleChange = (id, v) => {
            let { values } = this.state;
            values = _.assign({}, values, { [id]: v });
            this.setState({ values });
        };
        this.state = {
            groups: {},
            fields: {},
            values: {}
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { lists } = nextProps;
        let list = lists[MODEL_ID];
        if (!list)
            return { values: {} };
        if (list.results === prevState._results)
            return null;
        let nextState = {
            _results: list.results,
            groups: {},
            fields: {}
        };
        _.forEach(list.results, (item) => {
            let groupKey = item.group || 'Basic Settings';
            if (!nextState.groups[groupKey]) {
                nextState.groups[groupKey] = {
                    title: tr(groupKey, item.service || 'alaska-settings'),
                    items: []
                };
            }
            nextState.groups[groupKey].items.push(item);
            let field = _.assign({
                horizontal: true,
                label: tr(item.title, item.service),
                help: tr(item.help, item.service),
                service: item.service
            }, item.options);
            nextState.fields[item._id] = field;
        });
        return nextState;
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { action, lists, loadList, clearList } = this.props;
        let list = lists[MODEL_ID];
        if (!list) {
            loadList({
                model: MODEL_ID,
                limit: 1000
            });
            return;
        }
        if (this.request && action.request === this.request && !action.fetching) {
            this.request = '';
            clearList({
                model: MODEL_ID
            });
        }
    }
    render() {
        const { settings, history } = this.props;
        const { lists } = this.props;
        const { values, groups, fields } = this.state;
        const model = settings.models[MODEL_ID];
        let content;
        if (!lists[MODEL_ID] || !model) {
            content = React.createElement("div", { className: "loading" }, "Loading...");
        }
        else {
            content = [];
            _.forEach(groups, (group, index) => {
                let items = _.map(group.items, (item) => {
                    let FieldView = alaska_admin_view_1.views.components[item.type] || alaska_admin_view_1.views.components.MixedFieldView;
                    let value = values[item._id];
                    if (typeof value === 'undefined') {
                        value = item.value;
                    }
                    return React.createElement(FieldView, {
                        key: item._id,
                        className: 'form-group row',
                        model,
                        field: fields[item._id],
                        value: value,
                        onChange: (v) => this.handleChange(item._id, v)
                    });
                });
                content.push(React.createElement("div", { className: "card", key: index },
                    React.createElement("div", { className: "card-heading" }, group.title),
                    React.createElement("div", { className: "card-body" },
                        React.createElement("div", { className: "field-group-form form form-horizontal" }, items))));
            });
        }
        return (React.createElement("div", { className: "page settings-page" },
            React.createElement("div", { className: "page-inner" },
                React.createElement("div", { className: "toolbar" },
                    React.createElement("div", { className: "toolbar-inner" },
                        React.createElement("div", { className: "toolbar-title" }, tr('Settings', 'alaska-settings')))),
                React.createElement("div", { className: "editor" }, content),
                React.createElement(ActionBar_1.default, null,
                    React.createElement(ActionGroup_1.default, { history: history, model: model, items: [{
                                key: 'save',
                                action: {
                                    title: 'Save',
                                    color: 'primary'
                                },
                                onClick: this.handleSave
                            }] })))));
    }
}
exports.default = react_redux_1.connect((state) => ({ lists: state.lists, settings: state.settings, action: state.action }), (dispatch) => redux_1.bindActionCreators({
    loadList: listsRedux.loadList,
    clearList: listsRedux.clearList,
    actionRequest: actionRedux.actionRequest,
}, dispatch))(SettingsPage);
