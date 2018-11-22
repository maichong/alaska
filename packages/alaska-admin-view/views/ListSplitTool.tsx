import * as React from 'react';
import * as tr from 'grackle';
import { ToolProps } from '..';
import Node from './Node';

interface Props extends ToolProps {
  value: boolean;
  onChange: Function;
}

interface ListSplitToolState {
}

export default class ListSplitTool extends React.Component<Props, ListSplitToolState> {
  handleSplit = () => {
    this.props.onChange(!this.props.value);
  };

  render() {
    return (
      <Node
        className="list-split-tool"
        wrapper="ListSplitTool"
        props={this.props}
      >
        <button className="btn btn-default" onClick={this.handleSplit}>{tr('split')}</button>
      </Node>
    );
  }
}
