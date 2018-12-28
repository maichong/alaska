import * as React from 'react';
import classnames from 'classnames';
import { ActionBarProps } from '..';
import Node from './Node';

export default class ActionBar extends React.Component<ActionBarProps> {
  render() {
    const { className } = this.props;
    return (
      <Node
        wrapper="ActionBar"
        props={this.props}
        className={classnames('action-bar', className)}
      >
        <div className="container-fluid">{this.props.children}</div>
      </Node>
    );
  }
}
