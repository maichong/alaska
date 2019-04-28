"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const react_router_1 = require("react-router");
const modal_1 = require("@samoyed/modal");
const toast_1 = require("@samoyed/toast");
const ActionGroup_1 = require("./ActionGroup");
const ActionRedux = require("../redux/action");
const refreshRedux = require("../redux/refresh");
const check_ability_1 = require("../utils/check-ability");
class EditorActions extends React.Component {
    constructor(props) {
        super(props);
        this.handleAdd = () => {
            const { model } = this.props;
            let url = `/edit/${model.serviceId}/${model.modelName}/_new`;
            this.props.history.replace(url);
        };
        this.handleAction = async (action) => {
            const { model, actionRequest, record, refresh } = this.props;
            const config = model.actions[action];
            if (config && config.confirm) {
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
                    actionRequest({
                        model: `${model.serviceId}.${model.modelName}`,
                        action,
                        request,
                        records: record.isNew ? [] : [record._id],
                        body: record
                    });
                    this.setState({ request });
                }
                if (config.post === 'refresh') {
                    refresh();
                }
                else if (config.post && config.post.substr(0, 3) === 'js:') {
                    eval(config.post.substr(3));
                }
            }
            catch (error) {
                toast_1.default(tr('Failed'), error.message, { type: 'error' });
            }
        };
        this.handleRemove = async () => {
            let res = await modal_1.confirm(tr('Remove record'), tr('confirm remove record'));
            if (res) {
                await this.handleAction('remove');
            }
        };
        this.state = {};
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { action, model } = nextProps;
        if (prevState.request && prevState.request === action.request && !action.fetching) {
            let title = nextProps.action.action || 'action';
            if (action.error) {
                toast_1.default(tr(`${_.upperFirst(title)} Failure`), tr(action.error.message), { type: 'error' });
                return { request: '' };
            }
            else {
                toast_1.default(tr(`${title}`), tr(`${title} success!`), { type: 'success' });
                let id = _.get(action, 'result._id');
                let redirect;
                if (nextProps.record.isNew && id) {
                    redirect = `/edit/${model.serviceId}/${model.modelName}/${id}`;
                }
                else if (action.action === 'remove') {
                    redirect = `/list/${model.serviceId}/${model.modelName}`;
                }
                return { request: '', redirect };
            }
        }
        return null;
    }
    render() {
        const { model, record, superMode, history } = this.props;
        let redirect = this.state.redirect;
        if (redirect) {
            history.replace(redirect);
        }
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
        let actionList = [];
        keys.forEach((key) => {
            let action = actions[key];
            if (!(action.pages || ['editor']).includes('editor'))
                return;
            if (!superMode && check_ability_1.default(action.super, record))
                return;
            if (check_ability_1.default(action.hidden, record))
                return;
            let ability = action.ability || `${model.id}.${key}`;
            if (!check_ability_1.hasAbility(ability, record))
                return;
            let disabled = action.disabled && check_ability_1.default(action.disabled, record);
            let obj = {};
            if (key === 'create') {
                if (!record.isNew || model.nocreate)
                    return;
                obj.onClick = () => this.handleAction(key);
                obj.action = _.assign({
                    key: 'create',
                    icon: 'save',
                    color: 'primary',
                    tooltip: 'Save'
                }, action, disabled ? { disabled: true } : {});
            }
            else if (key === 'update') {
                if (record.isNew || model.noupdate)
                    return;
                obj.onClick = () => this.handleAction(key);
                obj.action = _.assign({
                    key: 'update',
                    icon: 'save',
                    color: 'primary',
                    tooltip: 'Save'
                }, action, disabled ? { disabled: true } : {});
            }
            else if (key === 'remove') {
                if (record.isNew || model.noremove)
                    return;
                obj.onClick = this.handleRemove;
                obj.action = _.assign({
                    key: 'remove',
                    icon: 'close',
                    color: 'danger',
                    tooltip: 'Remove'
                }, action, disabled ? { disabled: true } : {});
            }
            else if (key === 'add') {
                if (record.isNew || model.nocreate)
                    return;
                obj.onClick = this.handleAdd;
                obj.action = _.assign({
                    key: 'add',
                    icon: 'plus',
                    color: 'success',
                    tooltip: 'Create record'
                }, actions.create, actions.add, disabled ? { disabled: true } : {});
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
        return (React.createElement("div", { className: "editor-actions" },
            React.createElement(ActionGroup_1.default, { editor: true, history: history, items: actionList, model: model, record: record })));
    }
}
exports.default = react_redux_1.connect(({ settings, action }) => ({ superMode: settings.superMode, action }), (dispatch) => redux_1.bindActionCreators({
    actionRequest: ActionRedux.actionRequest,
    refresh: refreshRedux.refresh,
}, dispatch))(react_router_1.withRouter(EditorActions));
