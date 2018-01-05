// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { NavDropdown, MenuItem } from 'react-bootstrap';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as layoutRedux from '../redux/layout';
import * as settingsRedux from '../redux/settings';
import Node from './Node';
import LocaleNav from './LocaleNav';
import * as loginRedux from '../redux/login';

type Props = {
  children: React$Node,
  user: Object,
  layout: string,
  logout: Function,
  applyLayout: Function,
  refreshSettings: Function
};

class Header extends React.Component<Props> {
  static contextTypes = {
    actions: PropTypes.object,
    views: PropTypes.object,
    t: PropTypes.func
  };

  componentWillReceiveProps() {
    let newState = {};
    this.setState(newState);
  }

  handleToggle = () => {
    let { layout } = this.props;
    if (window.innerWidth <= 768) {
      //小屏幕
      if (layout.toString() === 'hidden') {
        layout = 'icon';
      } else {
        layout = 'hidden';
      }
    } else if (layout.toString() === 'full') {
      layout = 'icon';
    } else {
      layout = 'full';
    }
    this.props.applyLayout(layout);
  };

  handleRefresh = () => {
    this.props.refreshSettings();
  };

  handleLogout = () => {
    this.props.logout();
  };

  render() {
    const { user, layout } = this.props;
    const { t, views } = this.context;
    // $Flow
    const navs = _.map(views.navs, (Nav, index) => (<Nav key={index} />));
    let username = null;
    if (layout.toString() === 'full') {
      username = user.username;
    }

    return (
      <Node id="header" tag="nav" className="navbar navbar-default">
        <div className="container-fluid">
          <div className="nav menu-toggle" onClick={this.handleToggle}><i
            className="fa fa-bars"
          />
          </div>
          <Node id="topNav" tag="ul" className="nav navbar-nav navbar-right">
            {navs}
            <LocaleNav />
            <NavDropdown
              eventKey={3}
              title={<div><img alt="" src={user.avatar || 'statics/img/avatar.png'} />{username}</div>}
              id="userNav"
            >
              <MenuItem eventKey={3.1} onClick={this.handleRefresh}>{t('Refresh')}<i
                className="fa fa-refresh pull-right"
              />
              </MenuItem>
              <MenuItem eventKey={3.2} onClick={this.handleLogout}>{t('Logout')}<i
                className="fa fa-sign-out pull-right"
              />
              </MenuItem>
            </NavDropdown>
          </Node>
        </div>
      </Node>
    );
  }
}

export default connect(({ user, layout }) => ({ user, layout }), (dispatch) => bindActionCreators({
  logout: loginRedux.logout,
  applyLayout: layoutRedux.applyLayout,
  refreshSettings: settingsRedux.refreshSettings
}, dispatch))(Header);
