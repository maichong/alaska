// @flow

import React from 'react';
import type { Props } from 'alaska-admin-view/views/Copyright';
import Node from './Node';

export default class Copyright extends React.Component<Props> {
  render() {
    if (this.props.layout === 'icon') {
      return <Node id="copyright" props={this.props}>Alaska</Node>;
    }
    return <Node id="copyright" props={this.props}>Powered By Alaska</Node>;
  }
}
