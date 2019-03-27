"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const Node_1 = require("./Node");
class LoadingPage extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { wrapper: "Loading", props: this.props, className: "loading" },
            React.createElement("div", { className: "loading-text" },
                tr('Loading'),
                "...")));
    }
}
exports.default = LoadingPage;
