// @flow

import React from 'react';
import { NavDropdown, MenuItem } from 'react-bootstrap';

const { object } = React.PropTypes;

export default class LocaleNav extends React.Component {

  static contextTypes = {
    settings: object
  };

  render() {
    const { settings } = this.context;

    if (settings && settings.locales && Object.keys(settings.locales.all).length > 1) {
      let all = settings.locales.all;
      let locale = settings.locale;
      return (<NavDropdown title={<img alt="" src={'static/img/locales/' + locale + '.png'} />} id="localeNav">{
        Object.keys(all).map((key) => <MenuItem
          key={key}
          className="locales-nav-item"
          onClick={() => {
          location.href = '?locale=' + key + location.hash;
          }}
        ><img alt="" src={'static/img/locales/' + key + '.png'} /> {(all[key] || {}).lang || key}</MenuItem>)
      }</NavDropdown>);
    }
    return <div />;
  }
}
