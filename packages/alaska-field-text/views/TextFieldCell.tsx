import * as React from 'react';
import { CellViewProps } from 'alaska-admin-view';

export default class TextFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }
  render() {
    let { value } = this.props;
    if (!value) return null;
    if (value.length > 50) {
      value = `${value.substr(0, 50)}...`;
    }
    return (
      <div>{value}</div>
    );
  }
}
