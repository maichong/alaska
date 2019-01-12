import * as React from 'react';
import { FieldViewProps } from 'alaska-admin-view';
import Chart from './Chart';

export default class ChartReview extends React.Component<FieldViewProps> {
  render() {
    const { record } = this.props;
    if (!record || !record._id) return null;
    return (
      <Chart chart={record._id} filters={{ _r: record._rev }} />
    );
  }
}
