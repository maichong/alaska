import * as React from 'react';
import { CellViewProps } from 'alaska-admin-view';

export default class CheckboxFieldCell extends React.Component<CellViewProps> {
  render() {
    if (this.props.value) {
      return <i className="fa fa-check text-success" />;
    }
    return <i className="fa fa-times" style={{ color: '#aaa' }} />;
  }
}
