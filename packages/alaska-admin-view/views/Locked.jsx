// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Node from './Node';

export default class Locked extends React.Component<any> {
  static contextTypes = { t: PropTypes.func };

  render() {
    const { t } = this.context;
    return (<Node id="locked">
      <h1>{t('Access Denied')}</h1>
    </Node>);
  }
}
