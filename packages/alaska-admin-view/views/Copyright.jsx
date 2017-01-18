/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-29
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import Node from './Node';

const { string } = React.PropTypes;

export default class Copyright extends React.Component {

  static propTypes = {
    layout: string
  };

  render() {
    if (this.props.layout == 'icon') {
      return <Node id="copyright">Alaska</Node>
    }
    return <Node id="copyright">Powered By Alaska</Node>;
  }
}
