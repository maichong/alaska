// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import moment from 'moment';

export default class DateFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
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
