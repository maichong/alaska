"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Chart_1 = require("./Chart");
class ChartReview extends React.Component {
    render() {
        const { record } = this.props;
        if (!record || !record._id)
            return null;
        return (React.createElement(Chart_1.default, { chart: record._id, filters: { _r: record._rev } }));
    }
}
exports.default = ChartReview;
