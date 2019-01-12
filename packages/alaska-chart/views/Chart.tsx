import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import * as echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { api } from 'alaska-admin-view';

import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';

interface Props {
  chart: string;
  filters?: any;
  theme?: string;
}

interface State {
  _filters?: any;
  option: any;
  needLoading: boolean;
  loading: boolean;
}

export default class Chart extends React.Component<Props, State> {
  events: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      option: null,
      needLoading: true,
      loading: false
    };
    this.events = {
      dblclick: () => this.load()
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
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
    const { chart } = this.props;
    const { loading, needLoading } = this.state;
    if (chart && needLoading && !loading) {
      this.load();
    }
  }

  load() {
    const { chart, filters } = this.props;
    api.get(`chart/${chart}`, { query: filters }).then((res: echarts.EChartOption) => {
      _.forEach(res.series, (series) => {
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
      this.setState({ option: res, loading: false });
    });
    this.setState({ loading: true, needLoading: false });
  }

  render() {
    const { theme } = this.props;
    const { option } = this.state;
    if (!option) return <div>Loading chart...</div>
    return (
      <div className="chart-view">
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
}
