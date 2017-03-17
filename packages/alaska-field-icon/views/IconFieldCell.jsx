// @flow

import React from 'react';

export default class IconFieldCell extends React.Component {
  props: {
    value: string
  };

  shouldComponentUpdate(props: Object) {
    return props.value !== this.props.value;
  }

  render() {
    const { value } = this.props;
    if (!value) {
      return <div />;
    }
    return <i className={'fa fa-' + value} />;
  }
}
