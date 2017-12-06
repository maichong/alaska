// @flow

import React from 'react';
import Chart from './Chart';

export default class ChartReview extends React.Component<Alaska$view$Field$View$Props> {
  render() {
    const { record } = this.props;
    if (!record || !record._id) return null;
    return (
      <Chart chart={record._id} />
    );
  }
}
