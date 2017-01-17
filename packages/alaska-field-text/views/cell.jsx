// @flow

/* eslint eqeqeq:0 */

import React from 'react';

const { object, any, func } = React.PropTypes;

export default class TextFieldCell extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    value: any
  };

  static contextTypes = {
    t: func,
  };

  shouldComponentUpdate(props: Object) {
    return props.value != this.props.value;
  }

  render() {
    let { value, field, model } = this.props;
    if (!value) return null;
    if (value && field.translate) {
      const t = this.context.t;
      value = t(value, model.service.id);
    }
    if (value && value.length > 50) {
      value = value.substr(0, 50) + '...';
    }
    return (
      <div>{value}</div>
    );
  }
}
