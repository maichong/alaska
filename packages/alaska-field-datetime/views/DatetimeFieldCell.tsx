import * as React from 'react';
import * as moment from 'moment';
import { CellViewProps } from 'alaska-admin-view';

export default class DatetimeFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let props = this.props;
    let format = props.field.format ? props.field.format : 'YYYY-MM-DD HH:mm:ss';
    if (!props.value) {
      return <div className="datetime-field-cell" />;
    }
    return (
      <div className="datetime-field-cell">
        {moment(props.value).format(format)}
      </div>
    );
  }
}
