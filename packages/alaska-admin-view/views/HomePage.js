"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
class HomePage extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { wrapper: "HomePage", props: this.props },
            React.createElement("div", { className: "p-5 m-5 text-center" },
                React.createElement("h2", null, "Welcome"))));
    }
}
exports.default = HomePage;
