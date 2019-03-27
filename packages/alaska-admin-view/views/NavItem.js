"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const Node_1 = require("./Node");
class NavItem extends React.Component {
    render() {
        const { nav, navId, onClick } = this.props;
        return (React.createElement(Node_1.default, { tag: "li", wrapper: "Nav", props: this.props, className: `nav-item nav-tab ${nav.id === navId ? 'active' : ''}`, onClick: () => {
                if (nav.id === navId)
                    return;
                onClick(nav.id);
            } }, tr(nav.label)));
    }
}
exports.default = NavItem;
