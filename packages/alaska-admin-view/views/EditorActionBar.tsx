import * as React from 'react';
import Node from './Node';
import { EditorActionBarProps } from '..';
import EditorActions from './EditorActions';

interface EditorActionBarState {
}

export default class EditorActionBar extends React.Component<EditorActionBarProps, EditorActionBarState> {
  constructor(props: EditorActionBarProps) {
    super(props);
    this.state = {};
  }

  render() {
    let { model, record, isNew } = this.props;
    return (
      <Node
        wrapper="EditorActionBar"
        props={this.props}
        className="editor-action-bar"
      >
        <div className="container-fluid">
          {
            record ? <EditorActions
              model={model}
              record={record}
              isNew={isNew}
            /> : null
          }
        </div>
      </Node>
    );
  }
}
