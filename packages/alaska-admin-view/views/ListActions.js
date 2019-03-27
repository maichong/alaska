"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const qs = require("qs");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const react_router_1 = require("react-router");
const toast_1 = require("@samoyed/toast");
const modal_1 = require("@samoyed/modal");
const ActionGroup_1 = require("./ActionGroup");
const ActionRedux = require("../redux/action");
const check_ability_1 = require("../utils/check-ability");
class ListActions extends React.Component {
    constructor(props) {
        super(props);
        this.handleAction = async (action) => {
            const { model, selected, sort, filters, actionRequest } = this.props;
            const config = model.actions[action];
            if (!config)
                return;
            if (config.confirm) {
                let res = await modal_1.confirm(tr('Confirm'), tr(config.confirm, model.serviceId));
                if (!res)
                    return;
            }
            try {
                if (config.pre && config.pre.substr(0, 3) === 'js:') {
                    if (!eval(config.pre.substr(3))) {
                        return;
                    }
                }
                if (config.script && config.script.substr(0, 3) === 'js:') {
                    eval(config.script.substr(3));
                }
                else {
                    let request = String(Math.random());
                    let selecteds = _.map(selected, (item) => item._id);
                    actionRequest({
                        request,
                        model: model.id,
                        records: selecteds,
                        action,
                        search: filters._search || '',
                        sort,
                        filters: _.omit(filters, '_search'),
                        body: {}
                    });
                    this.setState({ request });
                }
                if (config.post && config.post.substr(0, 3) === 'js:') {
                    eval(config.post.substr(3));
                }
            }
            catch (err) {
                toast_1.default(tr('Failed'), err.message, { type: 'error' });
            }
        };
        this.handleRemove = async () => {
            let res = await modal_1.confirm(tr('Remove selected records'), tr('confirm remove selected records'));
            if (res) {
                await this.handleAction('remove');
            }
        };
        this.openPostWindow = (url) => {
            let newWin = window.open();
            let formStr = `<form style="visibility:hidden;" method="POST" action="${url}"></form>`;
            newWin.document.body.innerHTML = formStr;
            newWin.document.forms[0].submit();
            setTimeout(() => {
                newWin.close();
            }, 100);
            return newWin;
        };
        this.handleExport = () => {
            const { model, selected, sort, filters } = this.props;
            let selecteds = _.map(selected, (item) => item._id);
            let query = _.assign({
                _model: `${model.serviceId}.${model.modelName}`,
                _records: selecteds,
                _action: 'export',
                _sort: sort || ''
            }, filters);
            let queryStr = qs.stringify(query);
            let path = location.pathname;
            if (path === '/') {
                path = '';
            }
            let url = `${location.origin + path}action?${queryStr}`;
            this.openPostWindow(url);
        };
        this.state = {};
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let { action } = nextProps;
        if (prevState.request && action.request === prevState.request && !action.fetching) {
            let title = nextProps.action.action;
            if (nextProps.action.error) {
                toast_1.default(tr(`${_.upperFirst(title)} Failure`), tr(nextProps.action.error.message), { type: 'error' });
            }
            else {
                toast_1.default(tr(`${title} success!`), '', { type: 'success' });
            }
            return { request: '' };
        }
        return null;
    }
    render() {
        const { model, records, selected, superMode, history } = this.props;
        const { actions } = model;
        let map = {};
        _.forIn(actions, (item, key) => {
            map[key] = {
                key,
                action: item,
                afters: []
            };
        });
        let list = [];
        _.forEach(map, (el) => {
            let { after } = el.action;
            if (after && map[after]) {
                map[after].afters.push(el);
            }
            else {
                list.push(el);
            }
        });
        let keys = [];
        function flat(el) {
            keys.push(el.key);
            el.afters.forEach(flat);
        }
        _.forEach(list, flat);
        let record;
        if (selected) {
            record = selected[0];
        }
        let actionList = [];
        keys.forEach((key) => {
            let action = actions[key];
            if (!(action.pages || []).includes('list'))
                return;
            if (!superMode && check_ability_1.default(action.super, record))
                return;
            if (check_ability_1.default(action.hidden, record))
                return;
            let ability = action.ability || `${model.id}.${key}`;
            if (!check_ability_1.hasAbility(ability, record))
                return;
            let disabled = action.needRecords && (!selected || selected.length < action.needRecords);
            let obj = {};
            if (key === 'remove') {
                if (model.noremove)
                    return;
                obj.onClick = this.handleRemove;
                obj.action = _.assign({
                    key: 'remove',
                    icon: 'close',
                    color: 'danger',
                    tooltip: 'Remove selected records'
                }, action, disabled ? { disabled: true } : {});
            }
            else if (key === 'export') {
                if (model.noexport)
                    return;
                obj.onClick = this.handleExport;
                obj.action = _.assign({
                    key: 'export',
                    icon: 'download',
                    color: 'info',
                    tooltip: 'Export records'
                }, action, disabled ? { disabled: true } : {});
            }
            else if (key === 'add') {
                if (model.nocreate)
                    return;
                obj.link = `/edit/${model.serviceId}/${model.modelName}/_new`;
                obj.action = _.assign({
                    key: 'add',
                    icon: 'plus',
                    color: 'success',
                    tooltip: 'Create record'
                }, action, disabled ? { disabled: true } : {});
            }
            else {
                obj.action = _.assign({}, action, disabled ? { disabled: true } : {});
                if (action.link) {
                    obj.link = action.link;
                }
                if (action.sled) {
                    obj.onClick = () => this.handleAction(key);
                }
            }
            obj.key = key;
            actionList.push(obj);
        });
        return (React.createElement("div", { className: "list-actions" },
            React.createElement(ActionGroup_1.default, { history: history, items: actionList, model: model, selected: selected, records: records })));
    }
}
exports.default = react_redux_1.connect(({ settings, action }) => ({ superMode: settings.superMode, locale: settings.locale, action, settings }), (dispatch) => redux_1.bindActionCreators({ actionRequest: ActionRedux.actionRequest }, dispatch))(react_router_1.withRouter(ListActions));
