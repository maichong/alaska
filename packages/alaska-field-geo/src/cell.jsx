/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-28
 * @author Liang <liang@maichong.it>
 */

import React from 'react';

const { func } = React.PropTypes;

export default class GeoFieldCell extends React.Component {

  static contextTypes = {
    t: func,
  };

  shouldComponentUpdate(props) {
    return props.value != this.props.value;
  }

  render() {
    let value = this.props.value;
    if (!value || !value[0]) {
      return <div></div>;
    }
    const t = this.context.t;
    return <a
      href={`http://m.amap.com/navi/?dest=${value[0]},${value[1]}&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd`}
      target="_blank">{t('GEO')}</a>;
  }
}
