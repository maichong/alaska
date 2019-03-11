import * as React from 'react';
import Node from './Node';
import ListActions from './ListActions';
import { ListActionBarProps } from '..';
import ActionBar from './ActionBar';

export default class ListActionBar extends React.Component<ListActionBarProps> {
  render() {
    const { model, filters, records, selected, sort } = this.props;

    return (
      <Node
        wrapper="ListActionBar"
        props={this.props}
      >
        <ActionBar className="">
          <ListActions
            model={model}
            filters={filters}
            records={records}
            selected={selected}
            sort={sort}
          />
        </ActionBar>
      </Node>
    );
  }
}
