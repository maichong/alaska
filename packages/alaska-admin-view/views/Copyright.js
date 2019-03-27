"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
class Copyright extends React.Component {
    render() {
        const { copyright } = this.props;
        return (React.createElement(Node_1.default, { className: "copyright", wrapper: "Copyright", props: this.props },
            React.createElement("div", null, copyright)));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ copyright: settings.copyright }))(Copyright);
