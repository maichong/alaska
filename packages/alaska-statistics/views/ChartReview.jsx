// @flow

import React from 'react';
import Chart from './Chart';

export default class ChartReview extends React.Component {

  props: {
    data: Object
  };

  render() {
    const { data } = this.props;
    if (!data || !data._id) return null;
    return (
      <Chart chart={data._id} />
    );
  }
}
