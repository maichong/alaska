import * as React from 'react';
import * as _ from 'lodash';
import { CellViewProps } from 'alaska-admin-view';

export default class BytesFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    const { value, field } = this.props;
    let display: number = parseInt(value);
    if (display) {
      let { unit, size, precision } = field;
      let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
      while (display > (size || 0) && units.length > 1) {
        display /= (size || 0);
        units.shift();
      }
      // @ts-ignore
      display = _.round(display, precision) + units[0] + (unit || '');
    }
    return (
      <div>{display}</div>
    );
  }
}
