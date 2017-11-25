// @flow

import React from 'react';
import Chart from './Chart';

type Props = {
  data: Object
};

export default class ChartReview extends React.Component<Props> {
  render() {
    const { data } = this.props;
    if (!data || !data._id) return null;
    return (
      <Chart chart={data._id} />
    );
  }
}
