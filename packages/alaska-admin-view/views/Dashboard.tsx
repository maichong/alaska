import * as React from 'react';
import Content from './Content';
import Sidebar from './Sidebar';
import Node from './Node';
import { DashboardProps } from '..';

interface DashboardState {
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {};
  }

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
