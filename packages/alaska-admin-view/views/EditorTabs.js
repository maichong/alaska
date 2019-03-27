"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const _ = require("lodash");
const tr = require("grackle");
const classnames = require("classnames");
const Node_1 = require("./Node");
const RelationshipTab_1 = require("./RelationshipTab");
const check_ability_1 = require("../utils/check-ability");
function EditorTabs(props) {
    const { value, model, record, onChange } = props;
    let list = _.filter(model.relationships, (r) => !check_ability_1.default(r.hidden, record));
    if (!list.length)
        return null;
    return (React.createElement(Node_1.default, { className: "editor-tabs", wrapper: "EditorTabs", props: props },
        React.createElement("div", { className: classnames('editor-tab relationship-tab', { active: !value }), onClick: () => onChange('') }, tr(model.label, model.serviceId)),
        _.map(model.relationships, (rel) => React.createElement(RelationshipTab_1.default, { active: value === rel.key, key: rel.key, model: model, record: record, relationship: rel, onClick: () => onChange(rel.key) }))));
}
exports.default = EditorTabs;
