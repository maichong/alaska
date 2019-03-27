"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Node_1 = require("./Node");
const react_redux_1 = require("react-redux");
const Logo_1 = require("./Logo");
const Copyright_1 = require("./Copyright");
const Menu_1 = require("./Menu");
class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (opened) => {
            this.setState({ opened });
        };
        this.state = {
            opened: true
        };
    }
    render() {
        const { menus, layout } = this.props;
        const { opened } = this.state;
        if (layout === 'hidden') {
            return React.createElement("div", null);
        }
        return (React.createElement(Node_1.default, { className: "sidebar", wrapper: "Sidebar", props: this.props },
            React.createElement("div", { className: "sidebar-inner" },
                React.createElement(Logo_1.default, null),
                React.createElement(Menu_1.default, { menus: menus.menusMap[menus.navId || 'default'], onChange: this.handleChange, level: 0, opened: opened, layout: layout }),
                React.createElement(Copyright_1.default, null))));
    }
}
exports.default = react_redux_1.connect(({ menus, layout }) => ({ menus, layout }))(Sidebar);
