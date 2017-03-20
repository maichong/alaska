// @flow

import React from 'react';
import Node from './Node';

export default class Content extends React.Component {

  props: {
    children?: React$Element<any>
  };

  render() {
    let { children } = this.props;
    return (
      <Node id="content">
        <Node id="contentInner">{children}</Node>
      </Node>
    );
  }
}
