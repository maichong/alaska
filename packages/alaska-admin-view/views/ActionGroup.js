"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ActionView_1 = require("./ActionView");
const Node_1 = require("./Node");
class ActionGroup extends React.Component {
    render() {
        const { items, editor, model, record, records, selected, history } = this.props;
        return (React.createElement(Node_1.default, { wrapper: "ActionGroup", className: "action-group", props: this.props }, items.map((item) => {
            let { action, onClick, link } = item;
            return (React.createElement(ActionView_1.default, { key: item.key, history: history, editor: editor, action: action, record: record, records: records, selected: selected, model: model, onClick: onClick, link: link }));
        })));
    }
}
exports.default = ActionGroup;
