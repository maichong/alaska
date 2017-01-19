// @flow

import React from 'react';
import ChartJS from 'react-chartjs';
import { PREFIX, api } from 'alaska-admin-view';

const { string, number, func } = React.PropTypes;

export default class Chart extends React.Component {

  static propTypes = {
    chart: string,
    width: number,
    height: number,
    onLoadData: func
  };

  state: {
    raw:?Object;
    type:string;
    data:?Object;
    options:?Object;
    error:?Object;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      raw: null,
      type: '',
      data: null,
      options: null,
      error: null
    };
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(props: Object) {
    if (this.props.chart.toString() === props.chart.toString()) return;
    this.refresh(props);
  }

  async refresh(props: ?Object) {
    if (!props) {
      props = this.props;
    }
    let raw;
    if (props.onLoadData) {
      raw = await props.onLoadData(props.id);
    } else {
      raw = await api.get(PREFIX + '/api/chart?id=' + props.chart);
    }
    let error = raw.error;
    let type = '';
    let data = raw.data;
    let options = raw.options;
    if (!error) {
      type = (raw.type || '').replace(/^\S/, (s) => s.toUpperCase());
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
    let tmp: Object = { raw, error, type, data, options };
    this.setState(tmp);
  }

  render() {
    const { width, height } = this.props;
    const { error, type, data, options } = this.state;
    if (!data) {
      return <div className="chart-error">No Data</div>;
    }
    if (error) {
      return <div className="chart-error">{error}</div>;
    }

    let TypeChart = ChartJS[type];
    if (!TypeChart) {
      return <div className="chart-error">Unknown chart type</div>;
    }

    return (
      <div className="chart-box">
        <TypeChart width={width} height={height} data={data} options={options} />
      </div>
    );
  }
}
