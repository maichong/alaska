// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Node from './Node';
import type { Settings } from '../types';

export default class Logo extends React.Component {

  static contextTypes = {
    settings: PropTypes.object
  };

  context: {
    settings: Settings
  };

  render() {
    const { settings } = this.context;
    let logo = settings.logo || 'static/img/logo.png';
    let icon = settings.icon || 'static/img/icon.png';
    return (
      <Node id="logo">
        <a href="javascript:void(0)">
          <img alt="" className="logo" src={logo} />
          <img alt="" className="icon" src={icon} />
        </a>
      </Node>
    );
  }
}
