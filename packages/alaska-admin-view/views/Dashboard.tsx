import * as React from 'react';
import Content from './Content';
import Sidebar from './Sidebar';
import Node from './Node';
import { DashboardProps } from '..';

export default class Dashboard extends React.Component<DashboardProps> {
  render() {
    return (
      <Node
        className="dashboard"
        wrapper="Dashboard"
        props={this.props}
      >
        <Sidebar />
        <Content />
      </Node>
    );
  }
}
