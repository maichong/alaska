import * as _ from 'lodash';
import * as React from 'react';
import Node from './Node';
import { MenuProps, Settings, StoreState } from '..';
import MenuItem from './MenuItem';
import { connect } from 'react-redux';

interface Props extends MenuProps {
  settings: Settings;
}
interface MenuState {
  opendId: string;
}

class Menu extends React.Component<Props, MenuState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opendId: ''
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: MenuState) {
    if (!nextProps.opened && prevState.opendId) {
      return { opendId: '' };
    }

    let { menus } = nextProps;
    let path = window.location.hash.substr(1);
    if (path) {
      let menu = _.find(menus, (menu) => path === menu.link);
      if (menu) {
        return { openId: menu.id };
      }
    }
    return null;
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
    const { level, menus, layout, opened, onChange, settings } = this.props;
    const { opendId } = this.state;
    return (
      <Node
        className={`menu menu-${level}`}
        wrapper="Menu"
        props={this.props}
        tag="ul"
      >
        {
          _.map(menus, (menu) => {
            if (menu.ability && !settings.abilities[menu.ability]) return null;
            if (menu.super && !settings.superMode) return null;
            return (<MenuItem
              key={menu.id}
              openId={opendId}
              opened={opened}
              onClick={this.handleClick}
              onChange={onChange}
              menu={menu}
              layout={layout}
              level={level}
            />);
          })
        }
      </Node>
    );
  }
}

export default connect(({ settings }: StoreState) => ({ settings }))(Menu);
