"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
const LoginForm_1 = require("./LoginForm");
class LoginPage extends React.Component {
    render() {
        const { loginLogo } = this.props;
        return (React.createElement(Node_1.default, { className: "login-page", wrapper: "LoginPage", props: this.props },
            React.createElement("div", { className: "login-logo" },
                React.createElement("img", { alt: "", src: loginLogo || 'img/logo_reverse.png' })),
            React.createElement(LoginForm_1.default, null)));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ loginLogo: settings.loginLogo }))(LoginPage);
