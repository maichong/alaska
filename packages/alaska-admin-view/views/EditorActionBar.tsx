import * as React from 'react';
import Node from './Node';
import { EditorActionBarProps } from '..';
import EditorActions from './EditorActions';

export default class EditorActionBar extends React.Component<EditorActionBarProps> {
  render() {
    let { model, record } = this.props;
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
            /> : null
          }
        </div>
      </Node>
    );
  }
}
