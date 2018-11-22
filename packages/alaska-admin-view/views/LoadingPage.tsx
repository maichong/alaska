import * as React from 'react';
import * as tr from 'grackle';
import { LoadingPageProps } from '..';
import Node from './Node';

interface LoadingPageState {
}

export default class LoadingPage extends React.Component<LoadingPageProps, LoadingPageState> {
  constructor(props: LoadingPageProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Node
        wrapper="Loading"
        props={this.props}
        className="loading"
      >
        <div className="loading-text">{tr('Loading')}...</div>
      </Node>
    );
  }
}
