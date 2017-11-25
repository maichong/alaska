// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import PropTypes from 'prop-types';

export default class TextFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  static contextTypes = {
    t: PropTypes.func,
  };

  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value != this.props.value;
  }

  render() {
    let { value, field, model } = this.props;
    if (!value) return null;
    if (value && field.translate) {
      const { t } = this.context;
      value = t(value, model.serviceId);
    }
    if (value && value.length > 50) {
      value = value.substr(0, 50) + '...';
    }
    return (
      <div>{value}</div>
    );
  }
}
