// @flow

import React from 'react';
import Node from './Node';

type Props = {
  children: React$Node
};

export default class Content extends React.Component<Props> {
  render() {
    let { children } = this.props;
    return (
      <Node id="content">
        <Node id="contentInner">{children}</Node>
      </Node>
    );
  }
}
