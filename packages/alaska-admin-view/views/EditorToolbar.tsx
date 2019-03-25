import * as _ from 'lodash';
import * as React from 'react';
import ToolGroup from './ToolGroup';
import Node from './Node';
import EditorTabs from './EditorTabs';
import { EditorToolbarProps, views } from '..';

export default function EditorToolbar(props: EditorToolbarProps) {
  const { children, model, record, tab, onChangeTab } = props;
  const { editorTools } = views;
  let editorToolsViews = _.map(editorTools, (Item, index) => <Item key={index} />);
  return (
    <Node
      className="toolbar editor-toolbar"
      wrapper="EditorToolBar"
      props={props}
    >
      <div className="toolbar-inner">
        <div className="toolbar-title">{children}</div>
        {model && !_.isEmpty(model.relationships) && record && record.id && <EditorTabs model={model} record={record} value={tab} onChange={onChangeTab} />}
        <ToolGroup >
          {editorToolsViews}
        </ToolGroup>
      </div>
    </Node>
  );
}
