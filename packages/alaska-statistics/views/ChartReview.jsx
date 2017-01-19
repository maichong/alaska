// @flow

import React from 'react';
import Chart from './Chart';

const { object } = React.PropTypes;

export default class ChartReview extends React.Component {

  static propTypes = {
    data: object
  };

  render() {
    const { data } = this.props;
    if (!data || !data._id) return null;
    return (
      <Chart chart={data._id} />
    );
  }
}
