"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Content_1 = require("./Content");
const Sidebar_1 = require("./Sidebar");
const Node_1 = require("./Node");
class Dashboard extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { className: "dashboard", wrapper: "Dashboard", props: this.props },
            React.createElement(Sidebar_1.default, null),
            React.createElement(Content_1.default, null)));
    }
}
exports.default = Dashboard;
