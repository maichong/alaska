// @flow

import React from 'react';
import Node from './Node';

type Props = {
  layout: string
};

export default class Copyright extends React.Component<Props> {
  render() {
    if (this.props.layout == 'icon') {
      return <Node id="copyright">Alaska</Node>;
    }
    return <Node id="copyright">Powered By Alaska</Node>;
  }
}
