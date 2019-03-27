"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const loginRedux = require("../redux/login");
const modal_1 = require("@samoyed/modal");
class LogoutWidget extends React.Component {
    constructor() {
        super(...arguments);
        this.handleLogout = async () => {
            if (!await modal_1.confirm(tr('Confirm logout?')))
                return;
            this.props.logout();
        };
    }
    render() {
        let { user } = this.props;
        if (!user) {
            return null;
        }
        return (React.createElement("li", { className: "logout-widget" },
            React.createElement("button", { className: "btn", onClick: () => this.handleLogout() },
                React.createElement("i", { className: "fa fa-power-off" }))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ user: settings.user }), (dispatch) => redux_1.bindActionCreators({
    logout: loginRedux.logout
}, dispatch))(LogoutWidget);
