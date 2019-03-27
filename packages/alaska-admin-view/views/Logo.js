"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_redux_1 = require("react-redux");
const Node_1 = require("./Node");
class Logo extends React.Component {
    render() {
        const { logo: propLogo, icon: propIcon } = this.props;
        let logo = propLogo || 'img/logo.png';
        let icon = propIcon || 'img/icon.png';
        return (React.createElement(Node_1.default, { className: "logo", wrapper: "Logo", props: this.props },
            React.createElement(react_router_dom_1.Link, { to: "/" },
                React.createElement("img", { alt: "", className: "logo-img", src: logo }),
                React.createElement("img", { alt: "", className: "icon-img", src: icon }))));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ logo: settings.logo, icon: settings.icon }))(Logo);
