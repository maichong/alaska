/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-09-16
 * @author Liang <liang@maichong.it>
 */

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

  constructor(props) {
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

  componentWillReceiveProps(props) {
    if (this.props.chart == props.chart) return;
    this.refresh(props);
  }

  async refresh(props) {
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
    this.setState({ raw, error, type, data, options });
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
        <Chart width={width} height={height} data={data} options={options} />
      </div>
    );
  }
}
