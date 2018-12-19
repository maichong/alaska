import * as React from 'react';
import * as tr from 'grackle';
import { DeniedPageProps } from '..';
import Node from './Node';

export default class DeniedPage extends React.Component<DeniedPageProps> {
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
