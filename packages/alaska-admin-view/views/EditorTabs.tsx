import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as classnames from 'classnames';
import Node from './Node';
import RelationshipTab from './RelationshipTab';
import checkAbility from '../utils/check-ability';
import { EditorTabsProps } from '..';

export default function EditorTabs(props: EditorTabsProps) {
  const { value, model, record, onChange } = props;
  let list = _.filter(model.relationships, (r) => !checkAbility(r.hidden, record));
  if (!list.length) return null;
  return (
    <Node
      className="editor-tabs"
      wrapper="EditorTabs"
      props={props}
    >
      <div className={classnames('editor-tab relationship-tab', { active: !value })} onClick={() => onChange('')}>
        {tr(model.label, model.serviceId)}
      </div>
      {
        _.map(model.relationships, (rel) => <RelationshipTab
          active={value === rel.key}
          key={rel.key}
          model={model}
          record={record}
          relationship={rel}
          onClick={() => onChange(rel.key)}
        />)
      }
    </Node>
  );
}
