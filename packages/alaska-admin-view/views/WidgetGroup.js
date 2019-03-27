"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const __1 = require("..");
const Node_1 = require("./Node");
const LocaleWidget_1 = require("./LocaleWidget");
const RefreshWidget_1 = require("./RefreshWidget");
const UserWidget_1 = require("./UserWidget");
const LogoutWidget_1 = require("./LogoutWidget");
class WidgetGroup extends React.Component {
    render() {
        const { widgets } = __1.views;
        let widgetViews = _.map(widgets, (Item, index) => React.createElement(Item, { key: index }));
        return (React.createElement(Node_1.default, { tag: "ul", wrapper: "WidgetGroup", props: this.props, className: "widget-group" },
            widgetViews,
            React.createElement(LocaleWidget_1.default, null),
            React.createElement(RefreshWidget_1.default, null),
            React.createElement(LogoutWidget_1.default, null),
            React.createElement(UserWidget_1.default, null)));
    }
}
exports.default = WidgetGroup;
