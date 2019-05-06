"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const tr = require("grackle");
const toast_1 = require("@samoyed/toast");
const modal_1 = require("@samoyed/modal");
const ActionView_1 = require("./ActionView");
const check_ability_1 = require("../utils/check-ability");
class ListItemActions extends React.Component {
    constructor(props) {
        super(props);
        this.handleShow = () => {
            let { model, record, history } = this.props;
            history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
        };
        this.state = {};
    }
    async handleAction(action) {
        const { model, actionRequest, record, refresh } = this.props;
        if (action && action.confirm) {
            let res = await modal_1.confirm(tr('Confirm'), tr(action.confirm, model.serviceId));
            if (!res)
                return;
        }
        try {
            if (action.pre && action.pre.substr(0, 3) === 'js:') {
                if (!eval(action.pre.substr(3))) {
                    return;
                }
            }
            if (action.script && action.script.substr(0, 3) === 'js:') {
                eval(action.script.substr(3));
            }
            else {
                let request = String(Math.random());
                actionRequest({
                    model: `${model.serviceId}.${model.modelName}`,
                    action: action.key,
                    request,
                    records: record.isNew ? [] : [record._id],
                    body: record
                });
                this.setState({ request });
            }
            if (action.post === 'refresh') {
                refresh();
            }
            else if (action.post && action.post.substr(0, 3) === 'js:') {
                eval(action.post.substr(3));
            }
        }
        catch (error) {
            toast_1.default(tr('Failed'), error.message, { type: 'error' });
        }
    }
    ;
    async handleRemove(action) {
        let res = await modal_1.confirm(tr('Remove record'), tr('confirm remove record'));
        if (res) {
            this.handleAction(action);
        }
    }
    ;
    render() {
        const { model, record, history, superMode } = this.props;
        let actions = [
            React.createElement("i", { key: "show", className: "fa fa-eye text-primary", onClick: this.handleShow })
        ];
        _.forEach(model.actions, (action, key) => {
            if (!action.placements || !action.placements.includes('listItem'))
                return;
            if (key === 'remove' && model.noremove)
                return;
            if (!superMode && check_ability_1.default(action.super, record))
                return;
            if (check_ability_1.default(action.hidden, record))
                return;
            let ability = action.ability || `${model.id}.${key}`;
            if (!check_ability_1.hasAbility(ability, record))
                return;
            let link = '';
            let onClick = null;
            if (key === 'remove') {
                onClick = () => this.handleRemove(action);
            }
            else if (action.sled) {
                onClick = () => this.handleAction(action);
            }
            else {
                link = action.link;
            }
            actions.push(React.createElement(ActionView_1.default, { key: key, icon: true, model: model, record: record, history: history, action: action, link: link, onClick: onClick }));
        });
        return actions;
    }
}
exports.default = ListItemActions;
