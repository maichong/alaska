import * as React from 'react';
import Node from './Node';
import { HeaderProps } from '..';
import MenuToggle from './MenuToggle';
import Nav from './Nav';
import WidgetGroup from './WidgetGroup';

export default class Header extends React.Component<HeaderProps> {
  render() {
    return (
      <Node
        wrapper="Header"
        props={this.props}
        className="header"
      >
        <MenuToggle />
        <Nav />
        <div className="flex-fill" />
        <WidgetGroup />
      </Node>
    );
  }
}
