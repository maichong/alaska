"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const Node_1 = require("./Node");
const MenuItem_1 = require("./MenuItem");
const react_redux_1 = require("react-redux");
const check_ability_1 = require("../utils/check-ability");
class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = (menuId, opened) => {
            const { layout, onChange, opened: propOpened } = this.props;
            if (propOpened !== opened) {
                onChange(opened);
            }
            this.setState({ opendId: menuId });
        };
        this.state = {
            opendId: ''
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!nextProps.opened && prevState.opendId) {
            return { opendId: '' };
        }
        let { menus } = nextProps;
        let path = window.location.hash.substr(1);
        if (path) {
            let menu = _.find(menus, (m) => path === m.link);
            if (menu) {
                return { openId: menu.id };
            }
        }
        return null;
    }
    render() {
        const { level, menus, layout, opened, onChange, settings } = this.props;
        const { opendId } = this.state;
        return (React.createElement(Node_1.default, { className: `menu menu-${level}`, wrapper: "Menu", props: this.props, tag: "ul" }, _.map(menus, (menu) => {
            if (menu.ability && !check_ability_1.hasAbility(menu.ability))
                return null;
            if (menu.super && !settings.superMode)
                return null;
            return (React.createElement(MenuItem_1.default, { key: menu.id, openId: opendId, opened: opened, onClick: this.handleClick, onChange: onChange, menu: menu, layout: layout, level: level }));
        })));
    }
}
exports.default = react_redux_1.connect(({ settings }) => ({ settings }))(Menu);
