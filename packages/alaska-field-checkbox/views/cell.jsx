// @flow

import React from 'react';

const { bool } = React.PropTypes;

export default class CheckboxFieldCell extends React.Component {

  static propTypes = {
    value: bool
  };

  render() {
    if (this.props.value) {
      return <i className="fa fa-check text-success" />;
    }
    return <i className="fa fa-times" style={{ color: '#aaa' }} />;
  }
}
