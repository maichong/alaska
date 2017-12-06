// @flow

import React from 'react';
// $Flow
import * as ChartJS from 'react-chartjs-2';
import { api } from 'alaska-admin-view';

type Props = {
  chart: string,
  width?: number,
  height?: number,
  onLoadData?: Function
};

type State = {
  type: string,
  data: ?Object,
  options: ?Object,
  error: ?Object
};

const chartMap = {
  line: ChartJS.Line,
  bar: ChartJS.Bar,
  radar: ChartJS.Radar,
  pie: ChartJS.Pie,
  doughnut: ChartJS.Doughnut,
  polarArea: ChartJS.Polar,
};

export default class Chart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      type: '',
      data: null,
      options: null,
      error: null
    };
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(props: Props) {
    if (this.props.chart.toString() === props.chart.toString()) return;
    this.refresh(props);
  }

  async refresh(props: ?Props) {
    if (!props) {
      props = this.props;
    }
    let raw;
    if (props.onLoadData) {
      raw = await props.onLoadData(props.chart);
    } else {
      // $Flow
      raw = await api.get('/api/chart', {
        params: {
          id: props.chart
        }
      });
    }
    let error = raw.error;
    let type = '';
    let data = raw.data;
    let options = raw.options;
    if (!error) {
      type = (raw.type || '');
      let lastClick = 0;
      options.onClick = () => {
        let now = Date.now();
        if (now - lastClick < 500) {
          this.refresh();
          now = 0;
        }
        lastClick = now;
      };
    }
    let tmp: Object = {
      error, type, data, options
    };
    this.setState(tmp);
  }

  render() {
    const { width, height } = this.props;
    const {
      error, type, data, options
    } = this.state;
    if (!data) {
      return <div className="chart-error">No Data</div>;
    }
    if (error) {
      return <div className="chart-error">{error}</div>;
    }

    console.log(type, chartMap);
    let TypeChart = chartMap[type];
    if (!TypeChart) {
      return <div className="chart-error">Unknown chart type</div>;
    }

    return (
      <div className="chart-box">
        <TypeChart type={type} width={width} height={height} data={data} options={options} />
      </div>
    );
  }
}
