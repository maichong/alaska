import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import Node from './Node';
import { ListToolbarProps } from '..';
import ToolGroup from './ToolGroup';
import FiltersTool from './FiltersTool';
import ColumnsTool from './ColumnsTool';
import ListModeTool from './ListModeTool';
import ListSplitTool from './ListSplitTool';

interface ListToolbarState {
}

export default class ListToolbar extends React.Component<ListToolbarProps, ListToolbarState> {
  static contextTypes = {
    views: PropTypes.object
  };

  context: any;
  constructor(props: ListToolbarProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { listTools } = this.context.views;
    let { model, onChangeColumns, onFilters, onSplit, filters, columns, split } = this.props;
    let listToolsViews = _.map(listTools, (Item, index) => <Item key={index} />);
    listToolsViews.push(<FiltersTool key="FiltersTool" filters={filters} model={model} onChange={onFilters} page="list" />);
    listToolsViews.push(<ColumnsTool key="ColumnsTool" columns={columns} model={model} onChange={onChangeColumns} />);
    listToolsViews.push(<ListModeTool key="ListModeTool" page="list" />);
    listToolsViews.push(<ListSplitTool key="ListSplitTool" page="list" value={split} onChange={onSplit} />);
    return (
      <Node
        className="toolbar list-toolbar"
        wrapper="ListToolBar"
        props={this.props}
      >
        <div className="toolbar-inner">
          <div className="toolbar-title">{this.props.children}</div>
          <ToolGroup >
            {listToolsViews}
          </ToolGroup>
        </div>
      </Node>
    );
  }
}