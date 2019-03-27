"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
const Header_1 = require("./Header");
const Body_1 = require("./Body");
class Content extends React.Component {
    render() {
        return (React.createElement(Node_1.default, { className: "content", wrapper: "Content", props: this.props },
            React.createElement(Header_1.default, null),
            React.createElement(Body_1.default, null)));
    }
}
exports.default = Content;
