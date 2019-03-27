"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const Node_1 = require("./Node");
class ErrorPage extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { wrapper: "ErrorPage", props: this.props, className: "error-page" },
            React.createElement("div", { className: "error-info" },
                React.createElement("div", { className: "error-title" }, tr('Not found!')),
                React.createElement("div", { className: "error-desc" }, tr('Requested page not found.')))));
    }
}
exports.default = ErrorPage;
