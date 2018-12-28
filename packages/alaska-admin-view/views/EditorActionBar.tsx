import * as React from 'react';
import Node from './Node';
import { EditorActionBarProps } from '..';
import EditorActions from './EditorActions';
import ActionBar from './ActionBar';

export default class EditorActionBar extends React.Component<EditorActionBarProps> {
  render() {
    let { model, record } = this.props;
    return (
      <Node
        wrapper="EditorActionBar"
        props={this.props}
      >
        <ActionBar className="editor-action-bar">
          {
            record ? <EditorActions
              model={model}
              record={record}
            /> : null
          }
        </ActionBar>
      </Node>
    );
  }
}
