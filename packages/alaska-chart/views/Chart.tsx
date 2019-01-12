import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import * as echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { api } from 'alaska-admin-view';
import { ChartProps } from '..';

import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';

interface State {
  _filters?: any;
  option: echarts.EChartOption;
  options: echarts.EChartOption[];
  needLoading: boolean;
  loading: boolean;
}

function trChart(chart: echarts.EChartOption) {
  _.forEach(chart.series, (series) => {
    // @ts-ignore
    _.forEach(series.data, (slice) => {
      if (Array.isArray(slice)) {
        if (typeof slice[0] === 'string') {
          slice[0] = tr(slice[0]);
        }
      } else if (slice.name) {
        slice.name = tr(slice.name);
      }
    });
  })
}

export default class Chart extends React.Component<ChartProps, State> {
  events: any;

  constructor(props: ChartProps) {
    super(props);
    this.state = {
      option: null,
      options: [],
      needLoading: true,
      loading: false
    };
    this.events = {
      dblclick: () => this.load()
    };
  }

  static getDerivedStateFromProps(nextProps: ChartProps, prevState: State): Partial<State> | null {
    if (!_.isEqual(nextProps.filters, prevState._filters)) {
      return { _filters: nextProps.filters, needLoading: true };
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
    const { place, chart } = this.props;
    const { loading, needLoading } = this.state;
    if ((place || chart) && needLoading && !loading) {
      this.load();
    }
  }

  load() {
    const { place, chart, filters } = this.props;

    if (place) {
      api.get('chart', { query: _.assign({ _place: place }, filters) }).then((res: echarts.EChartOption[]) => {
        _.forEach(res, trChart)
        this.setState({ options: res, loading: false });
      });
    } else {
      api.get(`chart/${chart}`, { query: filters }).then((res: echarts.EChartOption) => {
        trChart(res);
        this.setState({ option: res, loading: false });
      });
    }
    this.setState({ loading: true, needLoading: false });
  }

  renderChart(option: echarts.EChartOption, index?: number) {
    const { theme } = this.props;
    return (
      <div className="chart-view" key={index}>
        <ReactEchartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          onEvents={this.events}
          theme={theme || 'light'}
        />
      </div>
    );
  }

  render() {
    const { place } = this.props;
    const { options, option } = this.state;
    if (place) {
      return (
        <div className={'chart-place chart-place-' + place}>
          {_.map(options, (opt, index) => this.renderChart(opt, index))}
        </div>
      );
    }
    if (!option) return <div>Loading chart...</div>
    return this.renderChart(option);
  }
}
