import * as React from 'react';
import * as tr from 'grackle';
import { Link } from 'react-router-dom';
import Node from './Node';
import { MenuItemProps } from '..';
import Menu from './Menu';

export default class MenuItem extends React.Component<MenuItemProps> {
  render() {
    const {
      level: propLevel, menu, openId, onClick, layout, opened, onChange
    } = this.props;
    let level = propLevel + 1;
    return (
      <Node
        className={`menu-item ${openId === menu.id && (!menu.subs || menu.subs.length <= 0) ? 'activated' : ''}`}
        wrapper="MenuItem"
        props={this.props}
        tag="li"
      >
        <Link to={menu.type === 'link' ? menu.link : ''} replace onClick={(e) => {
          let opened = false;
          if (menu.type !== 'link' || (menu.subs && menu.subs.length > 0)) {
            e.preventDefault();
            opened = true;
          }
          if (layout === 'full') {
            opened = true;
          }
          onClick(menu.id, opened);
        }}>
          <i className={`fa fa-${menu.icon}`} />
          <span>{tr(menu.label)}</span>
          {
            (menu.subs && menu.subs.length > 0) && <i
              className={`has-subs-icon fa fa-angle-${openId === menu.id ? 'up' : 'down'}`}
            />
          }
        </Link>
        {
          (menu.subs && menu.subs.length > 0 && openId === menu.id && opened)
          && <Menu opened={opened} onChange={onChange} layout={layout} menus={menu.subs} level={level} />
        }
      </Node>
    );
  }
}
