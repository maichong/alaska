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
interface State {
  toggleActive?: string;
  toggle?: boolean;
}

class Nav extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      toggleActive: '',
      toggle: false
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { settings, menus } = nextProps;
    let navs = settings.navItems;
    let nav = _.find(navs, (item) => item.id === menus.navId);
    if (nav && nav.label !== prevState.toggleActive) {
      return { toggleActive: nav.label };
    }
    return null;
  }

  handleClick = (navId: string) => {
    const { applyMenusNav } = this.props;
    this.setState({ toggle: !this.state.toggle });
    applyMenusNav(navId);
  }

  render() {
    const { settings, menus } = this.props;
    const { toggle, toggleActive } = this.state;
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
        className={`nav ${toggle ? 'visible' : 'hidden'}`}
      >
        <li
          className="nav-item nav-tab nav-toggle"
          onClick={() => { this.setState({ toggle: !toggle }) }}
        >
          {this.state.toggleActive || '选择菜单'}<i className="fa fa-sort-down ml-1" />
        </li>
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
