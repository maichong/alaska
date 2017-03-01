// @flow

import React from 'react';

export default class CheckboxFieldCell extends React.Component {

  props: {
    value: boolean
  };

  render() {
    if (this.props.value) {
      return <i className="fa fa-check text-success" />;
    }
    return <i className="fa fa-times" style={{ color: '#aaa' }} />;
  }
}
