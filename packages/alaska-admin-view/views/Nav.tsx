import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Node from './Node';
import { NavProps, StoreState, Menus, Settings } from '..';
import NavItem from './NavItem';
import * as menusRedux from '../redux/menus';
import * as tr from 'grackle';

interface Props extends NavProps {
  menus: Menus;
  settings: Settings;
  applyMenusNav: Function;
}
class Nav extends React.Component<Props> {
  handleClick = (navId: string) => {
    const { applyMenusNav } = this.props;
    applyMenusNav(navId);
  }

  render() {
    const { settings, menus } = this.props;
    let navs = _.orderBy(settings.navItems, ['sort'], ['desc']);
    navs = _.filter(navs, (item) =>
      (item.id === 'default' || item.activated)
      && (!item.ability || settings.abilities[item.ability])
      && (!item.super || settings.superMode)
    );
    return (
      <Node
        tag="ul"
        wrapper="Nav"
        props={this.props}
        className="nav"
      >
        {
          navs.length > 1 && _.map(navs, (nav) => <NavItem
            key={nav.id}
            onClick={this.handleClick}
            nav={nav}
            navId={menus.navId}
          />)
        }
      </Node>
    );
  }
}
export default connect(
  ({ menus, settings }: StoreState) => ({ menus, settings }),
  (dispatch) => bindActionCreators({ applyMenusNav: menusRedux.applyMenusNav }, dispatch)
)(Nav);
