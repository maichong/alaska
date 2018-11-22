import * as React from 'react';
import * as numeral from 'numeral';
import { CellViewProps } from 'alaska-admin-view';

export default class NumberFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let { value, field } = this.props;
    if (field.format) {
      value = numeral(value).format(field.format);
    }
    return (
      <div className="number-field-cell">{value}</div>
    );
  }
}
