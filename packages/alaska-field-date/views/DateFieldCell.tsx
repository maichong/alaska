import * as React from 'react';
import * as moment from 'moment';
import { CellViewProps } from 'alaska-admin-view';

export default class DateFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }

  render() {
    let { value, field } = this.props;
    if (!value) {
      return <div className="date-field-cell" />;
    }
    return (
      <div className="date-field-cell">
        {moment(value).format(field.cellFormat || field.format)}
      </div>
    );
  }
}
