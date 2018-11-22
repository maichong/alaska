import * as React from 'react';
import * as tr from 'grackle';
import { DeniedPageProps } from '..';
import Node from './Node';

interface DeniedPageState {
}

export default class DeniedPage extends React.Component<DeniedPageProps, DeniedPageState> {
  constructor(props: DeniedPageProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Node
        wrapper="Denied"
        props={this.props}
        className="denied"
      >
        <div className="denied-text">{tr('Access Denied')}</div>
      </Node>
    );
  }
}
