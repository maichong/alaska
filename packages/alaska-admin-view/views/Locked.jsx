/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-29
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import Node from './Node';

const { func } = React.PropTypes;

export default class Locked extends React.Component {

  static contextTypes = {
    t: func
  };

  render() {
    const t = this.context.t;
    return <Node id="locked">
      <h1>{t('Access Denied')}</h1>
    </Node>;
  }
}
