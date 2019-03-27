"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
const Node_1 = require("./Node");
const HomePage_1 = require("./HomePage");
const ListPage_1 = require("./ListPage");
const ErrorPage_1 = require("./ErrorPage");
const EditorPage_1 = require("./EditorPage");
const __1 = require("..");
class Body extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { className: "body", wrapper: "Body", props: this.props },
            React.createElement(react_router_dom_1.Switch, null,
                React.createElement(react_router_dom_1.Route, { component: HomePage_1.default, exact: true, path: "/" }),
                React.createElement(react_router_dom_1.Route, { component: ListPage_1.default, exact: true, path: "/list/:service/:model" }),
                React.createElement(react_router_dom_1.Route, { component: EditorPage_1.default, exact: true, path: "/edit/:service/:model/:id" }),
                (__1.views.routes || []).map((item) => (React.createElement(react_router_dom_1.Route, { key: item.path, component: item.component, exact: true, path: item.path }))),
                React.createElement(react_router_dom_1.Route, { component: ErrorPage_1.default }))));
    }
}
exports.default = Body;
