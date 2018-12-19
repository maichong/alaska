import * as _ from 'lodash';
import * as React from 'react';
import ToolGroup from './ToolGroup';
import Node from './Node';
import { EditorToolbarProps, views } from '..';

export default class EditorToolbar extends React.Component<EditorToolbarProps> {
  render() {
    const { editorTools } = views;
    let editorToolsViews = _.map(editorTools, (Item, index) => <Item key={index} />);
    return (
      <Node
        className="toolbar editor-toolbar"
        wrapper="EditorToolBar"
        props={this.props}
      >
        <div className="toolbar-inner">
          <div className="toolbar-title">{this.props.children}</div>
          <ToolGroup >
            {editorToolsViews}
          </ToolGroup>
        </div>
      </Node>);
  }
}
