// @flow

import React from 'react';
import Node from './Node';

export default class Copyright extends React.Component {

  props: {
    layout: string
  };

  render() {
    if (this.props.layout == 'icon') {
      return <Node id="copyright">Alaska</Node>;
    }
    return <Node id="copyright">Powered By Alaska</Node>;
  }
}
