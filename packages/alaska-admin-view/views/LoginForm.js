"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const loginRedux = require("../redux/login");
const redux_1 = require("redux");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleUsername = (e) => {
            this.setState({ username: e.target.value });
        };
        this.handlePassword = (e) => {
            this.setState({ password: e.target.value });
        };
        this.handleLogin = () => {
            let { username, password } = this.state;
            let state = {
                errorMsg: '',
                usernameError: '',
                passwordError: ''
            };
            if (!username) {
                state.usernameError = ' is-invalid';
            }
            if (!password) {
                state.passwordError = ' is-invalid';
            }
            this.setState(state);
            if (username && password) {
                this.props.loginAction({ username, password });
            }
        };
        this.handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        };
        this.state = {
            username: '',
            password: '',
            errorMsg: '',
            usernameError: '',
            passwordError: ''
        };
    }
    static getDerivedStateFromProps(nextProps) {
        let newState = { errorMsg: '' };
        if (nextProps.login.error) {
            newState.errorMsg = nextProps.login.error.message;
        }
        return newState;
    }
    render() {
        let state = this.state;
        return (React.createElement(Node_1.default, { className: "login-form", wrapper: "LoginForm", props: this.props },
            React.createElement("div", { className: "login-fileds" },
                React.createElement("div", { className: `input-group mb-3${state.usernameError}` },
                    React.createElement("div", { className: "input-group-prepend" },
                        React.createElement("div", { className: "input-group-text" },
                            React.createElement("i", { className: "fa fa-user" }))),
                    React.createElement("input", { type: "text", className: "form-control", placeholder: tr('Username'), onChange: this.handleUsername, value: state.username })),
                React.createElement("div", { className: `input-group mb-3${state.passwordError}` },
                    React.createElement("div", { className: "input-group-prepend" },
                        React.createElement("div", { className: "input-group-text" },
                            React.createElement("i", { className: "fa fa-key" }))),
                    React.createElement("input", { type: "password", className: "form-control", placeholder: tr('Password'), onChange: this.handlePassword, value: state.password, onKeyPress: this.handleKeyPress }))),
            React.createElement("div", { className: "btn btn-primary btn-block login-btn", onClick: this.handleLogin }, tr('Login')),
            state.errorMsg
                ? React.createElement("div", { className: "login-error" }, state.errorMsg)
                : null));
    }
}
exports.default = react_redux_1.connect(({ login }) => ({ login }), (dispatch) => redux_1.bindActionCreators({ loginAction: loginRedux.login }, dispatch))(LoginForm);
