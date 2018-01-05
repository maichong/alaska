// @flow

/* eslint no-script-url:0 */

import React from 'react';
import PropTypes from 'prop-types';
import Node from './Node';

export default class Logo extends React.Component<any> {
  static contextTypes = { settings: PropTypes.object };

  context: {
    settings: Alaska$view$Settings
  };

  render() {
    const { settings } = this.context;
    let logo = settings.logo || 'statics/img/logo.png';
    let icon = settings.icon || 'statics/img/icon.png';
    return (
      <Node id="logo">
        <a href="#/">
          <img alt="" className="logo" src={logo} />
          <img alt="" className="icon" src={icon} />
        </a>
      </Node>
    );
  }
}
