"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const refreshRedux = require("../redux/refresh");
class RefreshWidget extends React.Component {
    constructor() {
        super(...arguments);
        this.handleRefresh = () => {
            this.props.refresh();
        };
    }
    render() {
        return (React.createElement("li", { className: "refresh-widget" },
            React.createElement("button", { className: "btn", onClick: () => this.handleRefresh() },
                React.createElement("i", { className: "fa fa-refresh" }))));
    }
}
exports.default = react_redux_1.connect(() => ({}), (dispatch) => redux_1.bindActionCreators({
    refresh: refreshRedux.refresh
}, dispatch))(RefreshWidget);
