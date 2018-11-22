import * as React from 'react';
import Node from './Node';
import { HeaderProps } from '..';
import MenuToggle from './MenuToggle';
import Nav from './Nav';
import WidgetGroup from './WidgetGroup';

interface HeaderState {
}

export default class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Node
        wrapper="Header"
        props={this.props}
        className="header"
      >
        <MenuToggle />
        <Nav />
        <div className="header-space" />
        <WidgetGroup />
      </Node>
    );
  }
}
