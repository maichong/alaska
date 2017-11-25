// @flow

import React from 'react';
import PropTypes from 'prop-types';

export default class GeoFieldCell extends React.Component<Alaska$view$Field$Cell$Props> {
  static contextTypes = {
    t: PropTypes.func,
  };

  shouldComponentUpdate(props: Alaska$view$Field$Cell$Props) {
    return props.value !== this.props.value;
  }

  render() {
    let value = this.props.value;
    if (!value || !value[0]) {
      return <div />;
    }
    const { t } = this.context;
    return (<a
      href={
        'http://m.amap.com/navi/?dest=' + value[0] + ',' + value[1]
        + '&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd'
      }
      target="_blank"
      rel="noopener noreferrer"
    >{t('GEO')}
    </a>);
  }
}
