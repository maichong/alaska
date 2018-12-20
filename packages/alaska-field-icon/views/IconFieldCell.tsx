import * as React from 'react';
import { CellViewProps } from 'alaska-admin-view';

export default class IconFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    const { value } = this.props;
    if (!value) {
      return <div />;
    }
    return <i className={`fa fa-${value}`} />;
  }
}
