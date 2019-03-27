"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const Node_1 = require("./Node");
const NavItem_1 = require("./NavItem");
const menusRedux = require("../redux/menus");
class Nav extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = (navId) => {
            const { applyMenusNav } = this.props;
            this.setState({ toggle: !this.state.toggle });
            applyMenusNav(navId);
        };
        this.state = {
            toggleActive: '',
            toggle: false
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        const { settings, menus } = nextProps;
        let navs = settings.navItems;
        let nav = _.find(navs, (item) => item.id === menus.navId);
        if (nav && nav.label !== prevState.toggleActive) {
            return { toggleActive: nav.label };
        }
        return null;
    }
    render() {
        const { settings, menus } = this.props;
        const { toggle, toggleActive } = this.state;
        let navs = _.orderBy(settings.navItems, ['sort'], ['desc']);
        navs = _.filter(navs, (item) => (item.id === 'default' || item.activated)
            && (!item.ability || settings.abilities[item.ability])
            && (!item.super || settings.superMode));
        return (React.createElement(Node_1.default, { tag: "ul", wrapper: "Nav", props: this.props, className: `nav ${toggle ? 'visible' : 'hidden'}` },
            navs.length > 1 ? React.createElement("li", { className: "nav-item nav-tab nav-toggle", onClick: () => { this.setState({ toggle: !toggle }); } },
                this.state.toggleActive || '选择菜单',
                React.createElement("i", { className: "fa fa-sort-down ml-1" })) : null,
            navs.length > 1 && _.map(navs, (nav) => React.createElement(NavItem_1.default, { key: nav.id, onClick: this.handleClick, nav: nav, navId: menus.navId }))));
    }
}
exports.default = react_redux_1.connect(({ menus, settings }) => ({ menus, settings }), (dispatch) => redux_1.bindActionCreators({ applyMenusNav: menusRedux.applyMenusNav }, dispatch))(Nav);
