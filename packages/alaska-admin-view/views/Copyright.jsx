// @flow

import React from 'react';
import Node from './Node';

const { string } = React.PropTypes;

export default class Copyright extends React.Component {

  static propTypes = {
    layout: string
  };

  render() {
    if (this.props.layout == 'icon') {
      return <Node id="copyright">Alaska</Node>;
    }
    return <Node id="copyright">Powered By Alaska</Node>;
  }
}
