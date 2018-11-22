import * as _ from 'lodash';
import * as React from 'react';
import { ToolGroupProps } from '..';
import Node from './Node';

export default class ToolGroup extends React.Component<ToolGroupProps> {
  render() {
    return (
      <Node
        className="tool-group"
        wrapper="ToolGroup"
        props={this.props}
      >
        {this.props.children}
      </Node>
    );
  }
}
