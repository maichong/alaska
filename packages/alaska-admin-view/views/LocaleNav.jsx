/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-11
 * @author Liang <liang@maichong.it>
 */

import React from 'react';

import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

const { object, func } = React.PropTypes;

export default class LocaleNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextTypes = {
    settings: object,
    t: func,
  };

  render() {
    const { settings, t } = this.context;

    if (settings && settings.locales && Object.keys(settings.locales.all).length > 1) {
      let all = settings.locales.all;
      let locale = settings.locale;
      return <NavDropdown title={<img src={'static/img/locales/'+locale+'.png'}/>} id="localeNav">{
        Object.keys(all).map(key => <MenuItem
          key={key}
          className="locales-nav-item"
          onClick={()=>{location.href='?locale='+key+location.hash}}
        ><img src={'static/img/locales/'+key+'.png'}/> {(all[key] || {}).lang || key}</MenuItem>)
      }</NavDropdown>;
    } else {
      return <div></div>;
    }
  }
}
