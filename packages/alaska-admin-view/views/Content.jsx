// @flow

import React from 'react';
import Node from './Node';

const { node } = React.PropTypes;

export default class Content extends React.Component {

  static propTypes = {
    children: node
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
