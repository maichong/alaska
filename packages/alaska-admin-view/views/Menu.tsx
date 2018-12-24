import * as _ from 'lodash';
import * as React from 'react';
import Node from './Node';
import { MenuProps, StoreState, Menu as MenuType } from '..';
import MenuItem from './MenuItem';
import { connect } from 'react-redux';

interface Props extends MenuProps {
  locale: string;
  superMode: boolean;
  abilities: {
    [key: string]: boolean;
  }
}
interface MenuState {
  _superMode?: boolean;
  _menus?: any;
  opendId: string;
  menus: MenuType[];
}

class Menu extends React.Component<Props, MenuState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opendId: '',
      menus: []
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: MenuState) {
    let nextState: Partial<MenuState> = {
      _menus: nextProps.menus,
      _superMode: nextProps.superMode
    };
    if (!nextProps.opened && prevState.opendId) {
      nextState.opendId = '';
    }

    let { menus } = nextProps;
    let path = window.location.hash.substr(1);
    if (path) {
      let menu = _.find(menus, (menu) => path === menu.link);
      if (menu) {
        nextState.opendId = menu.id;
      }
    }
    if (nextProps.superMode !== prevState._superMode || menus !== prevState._menus) {
      nextState.menus = _.filter(menus, (item) => (
        (!item.ability || nextProps.abilities[item.ability])
        && (!item.super || nextProps.superMode)
      ))
    }
    return nextState;
  }

  handleClick = (menuId: string, opened: boolean) => {
    const { layout, onChange, opened: propOpened } = this.props;
    // const { opendId } = this.state;
    // if (layout === 'full' && opendId === menuId) {
    //   menuId = '';
    // }
    if (propOpened !== opened) {
      onChange(opened);
    }
    this.setState({ opendId: menuId });
  }

  render() {
    const { level, layout, opened, onChange } = this.props;
    const { opendId, menus } = this.state;
    return (
      <Node
        className={`menu menu-${level}`}
        wrapper="Menu"
        props={this.props}
        tag="ul"
      >
        {
          _.map(menus, (menu) => <MenuItem
            key={menu.id}
            openId={opendId}
            opened={opened}
            onClick={this.handleClick}
            onChange={onChange}
            menu={menu}
            layout={layout}
            level={level}
          />)
        }
      </Node>
    );
  }
}

export default connect(({ settings }: StoreState) => ({ locale: settings.locale, superMode: settings.superMode, abilities: settings.abilities }))(Menu);
