"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const tooltip_wrapper_1 = require("@samoyed/tooltip-wrapper");
class UserWidget extends React.Component {
    render() {
        let { user } = this.props;
        if (!user) {
            return null;
        }
        return (React.createElement(tooltip_wrapper_1.default, { placement: "bottom", tooltip: user.displayName || user.username },
            React.createElement("li", { className: "user-widget" },
                React.createElement("img", { className: "user-avatar", src: user.avatar || 'img/avatar.png', alt: "" }))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ user: settings.user }))(UserWidget);
