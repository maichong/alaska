"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
const modal_1 = require("@samoyed/modal");
const toast_1 = require("@samoyed/toast");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const layoutRedux = require("../redux/layout");
const LoadingPage_1 = require("./LoadingPage");
const LoginPage_1 = require("./LoginPage");
const Dashboard_1 = require("./Dashboard");
const DeniedPage_1 = require("./DeniedPage");
const Node_1 = require("./Node");
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.handleResize = () => {
            let { layout } = this.props;
            if (window.innerWidth <= 768) {
                if (layout === 'full') {
                    this.props.applyLayout('hidden');
                }
            }
            else if (layout === 'hidden') {
                this.props.applyLayout('full');
            }
        };
    }
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    renderPage() {
        const { settings } = this.props;
        if (!settings || !settings.copyright) {
            return React.createElement(LoadingPage_1.default, null);
        }
        if (!settings.user || !settings.user.id) {
            return React.createElement(LoginPage_1.default, null);
        }
        if (!settings.authorized) {
            return React.createElement(DeniedPage_1.default, null);
        }
        return React.createElement(Dashboard_1.default, null);
    }
    render() {
        const { layout } = this.props;
        return (React.createElement(Node_1.default, { className: `app ${layout}`, wrapper: "App", props: this.props },
            React.createElement(react_router_dom_1.HashRouter, null,
                React.createElement("div", { className: "alaska-app" }, this.renderPage())),
            React.createElement(toast_1.ToastContainer, { className: "toast-top-right" }),
            React.createElement(modal_1.default, null)));
    }
}
exports.default = react_redux_1.connect((state) => ({ settings: state.settings, layout: state.layout }), (dispatch) => redux_1.bindActionCreators({ applyLayout: layoutRedux.applyLayout }, dispatch))(App);
