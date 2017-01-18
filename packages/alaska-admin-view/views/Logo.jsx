/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-11
 * @author Liang <liang@maichong.it>
 */

import React from 'react';

import Node from './Node';

const { object } = React.PropTypes;

export default class Logo extends React.Component {

  static contextTypes = {
    settings: object
  };

  render() {
    const { settings } = this.context;
    let logo = settings.logo || 'static/img/logo.png';
    let icon = settings.icon || 'static/img/icon.png';
    return (
      <Node id="logo">
        <a href="#">
          <img className="logo" src={logo}/>
          <img className="icon" src={icon}/>
        </a>
      </Node>
    );
  }
}
