import * as React from 'react';
import Node from './Node';
import { HomePageProps } from '..';

export default class HomePage extends React.Component<HomePageProps> {
  render() {
    return (
      <Node
        wrapper="HomePage"
        props={this.props}
      >
        <div className="p-5 m-5 text-center"><h2>Welcome</h2></div>
      </Node>
    );
  }
}
