// @flow

import React from 'react';
import _ from 'lodash';

export default class BytesFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value !== this.props.value;
  }

  render() {
    const { value, field } = this.props;
    let display = parseInt(value);
    if (display) {
      let { unit, size, precision } = field;
      let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
      while (display > (size || 0) && units.length > 1) {
        display /= (size || 0);
        units.shift();
      }
      display = _.round(display, precision) + units[0] + (unit || '');
    }
    return (
      <div>{display}</div>
    );
  }
}
