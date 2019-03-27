"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const react_router_dom_1 = require("react-router-dom");
const Node_1 = require("./Node");
const Menu_1 = require("./Menu");
class MenuItem extends React.Component {
    render() {
        const { level: propLevel, menu, openId, onClick, layout, opened, onChange } = this.props;
        let level = propLevel + 1;
        return (React.createElement(Node_1.default, { className: `menu-item ${openId === menu.id && (!menu.subs || menu.subs.length <= 0) ? 'activated' : ''}`, wrapper: "MenuItem", props: this.props, tag: "li" },
            React.createElement(react_router_dom_1.Link, { to: menu.type === 'link' ? menu.link : '', replace: true, onClick: (e) => {
                    let o = false;
                    if (menu.type !== 'link' || (menu.subs && menu.subs.length > 0)) {
                        e.preventDefault();
                        o = true;
                    }
                    if (layout === 'full') {
                        o = true;
                    }
                    onClick(menu.id, o);
                } },
                React.createElement("i", { className: `fa fa-${menu.icon}` }),
                React.createElement("span", null, tr(menu.label)),
                (menu.subs && menu.subs.length > 0) && React.createElement("i", { className: `has-subs-icon fa fa-angle-${openId === menu.id ? 'up' : 'down'}` })),
            (menu.subs && menu.subs.length > 0 && openId === menu.id && opened)
                && React.createElement(Menu_1.default, { opened: opened, onChange: onChange, layout: layout, menus: menu.subs, level: level })));
    }
}
exports.default = MenuItem;
