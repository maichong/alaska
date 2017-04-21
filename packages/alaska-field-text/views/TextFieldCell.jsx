// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import PropTypes from 'prop-types';

export default class TextFieldCell extends React.Component {

  static contextTypes = {
    t: PropTypes.func,
  };

  props: {
    model: Object,
    field: Object,
    value: any
  };

  shouldComponentUpdate(props: Object) {
    return props.value != this.props.value;
  }

  render() {
    let { value, field, model } = this.props;
    if (!value) return null;
    if (value && field.translate) {
      const t = this.context.t;
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
