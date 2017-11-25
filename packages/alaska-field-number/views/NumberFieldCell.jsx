// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import numeral from 'numeral';

export default class NumberFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value != this.props.value;
  }

  render() {
    let props = this.props;
    let value = props.value;
    if (props.field.format) {
      value = numeral(value).format(props.field.format);
    }
    return (
      <div className="number-field-cell">{value}</div>
    );
  }
}
