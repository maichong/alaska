import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import ToolGroup from './ToolGroup';
import Node from './Node';
import { EditorToolbarProps } from '..';

interface EditorToolbarState {
}

export default class EditorToolbar extends React.Component<EditorToolbarProps, EditorToolbarState> {
  static contextTypes = {
    views: PropTypes.object
  };

  context: any;
  constructor(props: EditorToolbarProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { editorTools } = this.context.views;
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
