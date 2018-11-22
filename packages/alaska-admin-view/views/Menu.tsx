import * as _ from 'lodash';
import * as React from 'react';
import Node from './Node';
import { MenuProps, Settings, State } from '..';
import MenuItem from './MenuItem';
import { connect } from 'react-redux';

interface Props extends MenuProps {
  locale: string;
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

  componentWillMount() {
    let { menus } = this.props;
    let hash = window.location.hash;
    let path = hash.split('#').length > 1 ? hash.split('#')[1] : '';
    if (path) {
      _.forEach(menus, (menu) => {
        if (path === menu.link) {
          this.setState({ opendId: menu.id });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { opened } = nextProps;
    if (!opened) {
      this.setState({ opendId: '' });
    }
  }

  handleClick = (menuId: string, opened: boolean) => {
    const { layout, onChange, opened: propOpened } = this.props;
    const { opendId } = this.state;
    // if (layout === 'full' && opendId === menuId) {
    //   menuId = '';
    // }
    if (propOpened !== opened) {
      onChange(opened);
    }
    this.setState({ opendId: menuId });
  }

  render() {
    const { level, menus, layout, opened, onChange } = this.props;
    const { opendId } = this.state;
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

export default connect(({ settings }: State) => ({ locale: settings.locale }))(Menu);
