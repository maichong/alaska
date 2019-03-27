"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
class GeoFieldCell extends React.Component {
    shouldComponentUpdate(props) {
        return props.value !== this.props.value;
    }
    render() {
        let value = this.props.value;
        if (!value || !value[0]) {
            return React.createElement("div", null);
        }
        return (React.createElement("a", { href: `http://m.amap.com/navi/?dest=${value[0]},${value[1]}&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd`, target: "_blank", rel: "noopener noreferrer" }, tr('GEO')));
    }
}
exports.default = GeoFieldCell;
