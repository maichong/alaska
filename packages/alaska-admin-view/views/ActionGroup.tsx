import * as _ from 'lodash';
import * as React from 'react';
import { ActionGroupProps } from '..';
import ActionView from './ActionView';
import Node from './Node';

export default class ActionGroup extends React.Component<ActionGroupProps> {
  render() {
    const {
      items, editor, model, record, records, selected
    } = this.props;
    return (
      <Node
        wrapper="ActionGroup"
        className="action-group"
        props={this.props}
      >
        {
          items.map((item) => {
            let { action, onClick, link } = item;
            return (
              <ActionView
                key={item.key}
                editor={editor}
                action={action}
                record={record}
                records={records}
                selected={selected}
                model={model}
                onClick={onClick}
                link={link}
              />
            );
          })
        }
      </Node>
    );
  }
}
