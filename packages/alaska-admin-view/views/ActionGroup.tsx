import * as _ from 'lodash';
import * as React from 'react';
import { ActionGroupProps } from '..';
import ActionView from './ActionView';

interface ActionGroupState {
}

export default class ActionGroup extends React.Component<ActionGroupProps, ActionGroupState> {
  constructor(props: ActionGroupProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      items, editor, model, record, records, selected
    } = this.props;
    return (
      <div className="action-group">
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
      </div>
    );
  }
}