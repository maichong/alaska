// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import moment from 'moment';

export default class DatetimeFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value != this.props.value;
  }

  render() {
    let props = this.props;
    if (!props.value) {
      return <div className="datetime-field-cell" />;
    }
    return (
      <div className="datetime-field-cell">
        {moment(props.value).format(props.field.format)}
      </div>
    );
  }
}
