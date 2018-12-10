import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import Node from './Node';
import { EditorProps, FieldGroup as FieldGroupType } from '..';
import FieldGroup from './FieldGroup';

type Errors = immutable.Immutable<{
  [key: string]: string;
}>;

interface EditorState {
  _record?: any;
  errors: Errors;
}

function checkErrors(props?: EditorProps, errors?: Errors | null): Errors {
  const { model, record } = props;
  errors = errors || immutable({});
  _.forEach(model.fields, (field, key) => {
    if (field.required && !record[key]) {
      let value = tr('This field is required!');
      errors = errors.set(key, value);
    } else if (field.required && typeof record[key] === 'object' && !_.size(record[key])) {
      let value = tr('This field is required!');
      errors = errors.set(key, value);
    } else if (errors[key]) {
      errors = errors.without(key);
    }
  });
  return errors;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      errors: immutable({})
    };
  }

  static getDerivedStateFromProps(nextProps: EditorProps, prevState: EditorState) {
    const { errors: stateError } = prevState;
    if (nextProps.record !== prevState._record) {
      let errors = checkErrors(nextProps, stateError);
      return { errors };
    }
    return null;
  }

  reduceGroups() {
    let { model, record, isNew, onChange } = this.props;
    let { errors } = this.state;
    let groups: { [key: string]: FieldGroupType } = {
      default: {
        title: '',
        fields: [],
        path: 'default',
        model,
        record,
        isNew,
        errors,
        onFieldChange: onChange,
        panel: false
      }
    };
    _.forEach(model.groups, (group, key: string) => {
      group.title = group.title || key;
      group.fields = [];
      group.path = group.path || key;
      group.model = model;
      group.record = record;
      group.isNew = isNew;
      group.errors = errors;
      group.onFieldChange = onChange;
      if (key === 'default') {
        group = Object.assign(group, groups.default);
      }
      groups[key] = group;
    });
    _.forEach(model.fields, (field) => {
      if (!field.group || !groups[field.group]) {
        groups.default.fields.push(field);
      } else {
        groups[field.group].fields.push(field);
      }
    });
    for (let groupKey of Object.keys(groups)) {
      let group = this.fieldSort(groups[groupKey]);
      if (!group) {
        delete groups[groupKey];
      } else {
        groups[groupKey] = group;
      }
    }
    return groups;
  }

  fieldSort(group: FieldGroupType) {
    if (!group.fields.length) {
      return null;
    }
    let fieldTitleList: string[] = _.map(group.fields, (field) => field.path);
    for (let field of group.fields) {
      if (field.after && fieldTitleList.indexOf(field.after) > -1) {
        let selfIndex = fieldTitleList.indexOf(field.path);
        let afterIndex = fieldTitleList.indexOf(field.after);
        fieldTitleList.splice(
          afterIndex < selfIndex ? afterIndex + 1 : afterIndex,
          0,
          fieldTitleList.splice(selfIndex, 1)[0]
        );
      }
    }
    let list = [];
    for (let i = 0; i < fieldTitleList.length; i += 1) {
      for (let field of group.fields) {
        if (field.path === fieldTitleList[i]) {
          list.push(field);
        }
      }
    }
    group.fields = list;
    return group;
  }

  render() {
    const { errors } = this.state;
    let groups = this.reduceGroups();
    return (
      <Node
        wrapper="Editor"
        props={this.props}
        className="editor"
      >
        {
          _.map(groups, (group, groupKey: string) => <FieldGroup
            errors={errors}
            key={groupKey}
            panel={group.panel === false ? false : group.panel}
            {...group}
          />)
        }
      </Node>
    );
  }
}
