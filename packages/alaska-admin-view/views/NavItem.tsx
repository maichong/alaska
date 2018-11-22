import * as React from 'react';
import * as tr from 'grackle';
import Node from './Node';
import { NavItemProps } from '..';

interface NavItemState {
}

export default class NavItem extends React.Component<NavItemProps, NavItemState> {
  constructor(props: NavItemProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { nav, navId, onClick } = this.props;
    return (
      <Node
        tag="li"
        wrapper="Nav"
        props={this.props}
        className={`nav-item nav-tab ${nav.id === navId ? 'active' : ''}`}
        onClick={() => {
          if (nav.id === navId) return;
          onClick(nav.id);
        }}
      >
        {tr(nav.label)}
      </Node>
    );
  }
}
