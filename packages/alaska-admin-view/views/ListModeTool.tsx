import * as React from 'react';
import * as tr from 'grackle';
import Node from './Node';
import { ToolProps } from '..';

interface ListModeToolState {
  mode: string;
  open: boolean;
}

const options = [{
  label: 'list',
  value: 'list'
}, {
  label: 'card',
  value: 'th-large'
}];

export default class ListModeTool extends React.Component<ToolProps, ListModeToolState> {
  constructor(props: ToolProps) {
    super(props);
    this.state = {
      mode: options[0].value,
      open: false
    };
  }

  render() {
    // let { mode, open } = this.state;
    let { page } = this.props;
    if (page === 'editor') return null;

    // TODO:
    return '';
  }
}
