import * as React from 'react';
import Node from './Node';
import { connect } from 'react-redux';
import Logo from './Logo';
import Copyright from './Copyright';
import Menu from './Menu';
import { SidebarProps, Menus, State } from '..';

interface SidebarState {
  opened: boolean;
}
interface Props extends SidebarProps {
  menus: Menus;
  layout: string;
}

class Sidebar extends React.Component<Props, SidebarState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opened: true
    };
  }

  //是否关闭所有一弹出的Menu
  handleChange = (opened: boolean) => {
    this.setState({ opened });
  }

  render() {
    const { menus, layout } = this.props;
    const { opened } = this.state;
    if (layout === 'hidden') {
      return <div />;
    }
    return (
      <Node
        className="sidebar"
        wrapper="Sidebar"
        props={this.props}
      >
        <div className="sidebar-inner">
          <Logo />
          <Menu
            menus={menus.menusMap[menus.navId || 'default']}
            onChange={this.handleChange}
            level={0}
            opened={opened}
            layout={layout}
          />
          <Copyright />
        </div>
      </Node>
    );
  }
}
export default connect(
  ({ menus, layout }: State) => ({ menus, layout })
)(Sidebar);
