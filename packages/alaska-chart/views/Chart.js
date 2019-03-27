"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const tr = require("grackle");
const _ = require("lodash");
const echarts = require("echarts/lib/echarts");
const core_1 = require("echarts-for-react/lib/core");
const alaska_admin_view_1 = require("alaska-admin-view");
require("echarts/lib/chart/line");
require("echarts/lib/chart/bar");
require("echarts/lib/chart/pie");
require("echarts/lib/component/grid");
require("echarts/lib/component/title");
require("echarts/lib/component/legend");
require("echarts/lib/component/tooltip");
function trChart(chart) {
    _.forEach(chart.series, (series) => {
        _.forEach(series.data, (slice) => {
            if (Array.isArray(slice)) {
                if (typeof slice[0] === 'string') {
                    slice[0] = tr(slice[0]);
                }
            }
            else if (slice.name) {
                slice.name = tr(slice.name);
            }
        });
    });
}
class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            option: null,
            options: null,
            needLoading: true,
            loading: false
        };
        this.events = {
            dblclick: () => this.load()
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (!_.isEqual(nextProps.filters, prevState._filters) || !_.isEqual(nextProps.chart, prevState._chart)) {
            return { _filters: nextProps.filters, _chart: nextProps.chart, needLoading: true };
        }
        return null;
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { place, chart, data } = this.props;
        if (data)
            return;
        const { loading, needLoading } = this.state;
        if ((place || chart) && needLoading && !loading) {
            this.load();
        }
    }
    load() {
        const { place, chart, filters, data } = this.props;
        if (data)
            return;
        if (place) {
            alaska_admin_view_1.api.get('chart', { query: _.assign({ _place: place }, filters) }).then((res) => {
                _.forEach(res, trChart);
                this.setState({ options: res, loading: false });
            });
        }
        else {
            if (chart && typeof chart === 'object') {
                alaska_admin_view_1.api.get('chart', { query: { _chart: chart } }).then((res) => {
                    _.forEach(res, trChart);
                    this.setState({ options: res, loading: false });
                });
            }
            else {
                alaska_admin_view_1.api.get(`chart/${chart}`, { query: filters }).then((res) => {
                    trChart(res);
                    this.setState({ option: res, loading: false });
                });
            }
        }
        this.setState({ loading: true, needLoading: false });
    }
    renderChart(option, index) {
        const { theme } = this.props;
        return (React.createElement("div", { className: "chart-view", key: index },
            React.createElement(core_1.default, { echarts: echarts, option: option, notMerge: true, lazyUpdate: true, onEvents: this.events, theme: theme || 'light' })));
    }
    render() {
        const { place, data } = this.props;
        const { options, option } = this.state;
        if (data) {
            return this.renderChart(data);
        }
        if (options) {
            return (React.createElement("div", { className: `chart-place chart-place-${place}` }, _.map(options, (opt, index) => this.renderChart(opt, index))));
        }
        if (!option)
            return React.createElement("div", null, "Loading chart...");
        return this.renderChart(option);
    }
}
exports.default = Chart;
