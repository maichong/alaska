import * as React from 'react';
import * as tr from 'grackle';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
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
    const { value } = this.props;
    return (
      <Node
        className="list-split-tool"
        wrapper="ListSplitTool"
        props={this.props}
      >
        <TooltipWrapper
          tooltip={tr('Quick Viewer')}
          placement="bottom"
        >
          <button className={'btn btn-light' + (value ? ' active' : '')} onClick={this.handleSplit}>
            <i className="fa fa-pencil-square-o" />
          </button>
        </TooltipWrapper>
      </Node>
    );
  }
}
