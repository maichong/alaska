// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { NavDropdown, MenuItem } from 'react-bootstrap';

export default class LocaleNav extends React.Component<any> {
  static contextTypes = {
    settings: PropTypes.object
  };

  render() {
    const { settings } = this.context;

    if (settings && settings.locales && Object.keys(settings.locales.all).length > 1) {
      let { all } = settings.locales;
      let { locale } = settings;
      return (<NavDropdown title={<img alt="" src={'statics/img/locales/' + locale + '.png'} />} id="localeNav">{
        Object.keys(all).map((key) => (<MenuItem
          key={key}
          className="locales-nav-item"
          onClick={() => {
            window.location.href = '?locale=' + key + window.location.hash;
          }}
        ><img alt="" src={'statics/img/locales/' + key + '.png'} /> {(all[key] || {}).lang || key}
        </MenuItem>))
      }
      </NavDropdown>);
    }
    return <div />;
  }
}
