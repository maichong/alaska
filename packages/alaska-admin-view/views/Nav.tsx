import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Node from './Node';
import { NavProps, State, Menus, Settings } from '..';
import NavItem from './NavItem';
import * as menusRedux from '../redux/menus';
import * as tr from 'grackle';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';

interface NavState {
  navOpen: boolean;
}

interface Props extends NavProps {
  menus: Menus;
  settings: Settings;
  applyMenusNav: Function;
}
class Nav extends React.Component<Props, NavState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      navOpen: false
    };
  }

  handleClick = (navId: string) => {
    const { applyMenusNav } = this.props;
    applyMenusNav(navId);
  }

  render() {
    const { settings, menus } = this.props;
    const { navOpen } = this.state;
    const { abilities } = settings;
    let navs = _.orderBy(settings.navItems, ['sort'], ['desc']);
    navs = _.filter(navs, (item) => (item.id === 'default' || item.activated) && abilities[item.ability]);
    let label = _.map(navs, (nav) => {
      if (nav.id !== menus.navId) return;
      return tr(nav.label);
    });
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
        <ButtonDropdown
          isOpen={this.state.navOpen}
          toggle={() => this.setState({ navOpen: !navOpen })}
        >
          <DropdownToggle color="default">
            <span className="label">{label}</span>
            <i className="fa fa-caret-down" />
          </DropdownToggle>
          <DropdownMenu>
            {
              navs.length > 1 && _.map(navs, (nav) => (
                <DropdownItem
                  key={nav.id}
                  onClick={() => this.handleClick(nav.id)}
                  className={`${nav.id === menus.navId ? 'active' : ''}`}
                >
                  {tr(nav.label)}
                </DropdownItem>
              ))
            }
          </DropdownMenu>
        </ButtonDropdown>
      </Node>
    );
  }
}
export default connect(
  ({ menus, settings }: State) => ({ menus, settings }),
  (dispatch) => bindActionCreators({ applyMenusNav: menusRedux.applyMenusNav }, dispatch)
)(Nav);
