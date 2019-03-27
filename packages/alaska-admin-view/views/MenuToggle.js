"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const Node_1 = require("./Node");
const layoutRedux = require("../redux/layout");
class MenuToggle extends React.Component {
    constructor() {
        super(...arguments);
        this.handleToggle = () => {
            let { layout } = this.props;
            if (window.innerWidth <= 768) {
                if (layout.toString() === 'hidden') {
                    layout = 'icon';
                }
                else {
                    layout = 'hidden';
                }
            }
            else if (layout.toString() === 'full') {
                layout = 'icon';
            }
            else {
                layout = 'full';
            }
            this.props.applyLayout(layout);
        };
    }
    render() {
        return (React.createElement(Node_1.default, { wrapper: "MenuToggle", props: this.props, className: "menu-toggle" },
            React.createElement("button", { className: "btn btn-light", onClick: this.handleToggle },
                React.createElement("i", { className: "fa fa-bars" }))));
    }
}
exports.default = react_redux_1.connect(({ layout }) => ({ layout }), (dispatch) => redux_1.bindActionCreators({ applyLayout: layoutRedux.applyLayout }, dispatch))(MenuToggle);
