import { ObjectMap } from 'alaska';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import Node from './Node';
import { EditorProps, FieldGroupProps } from '..';
import FieldGroup from './FieldGroup';
import { hasAbility } from '../utils/check-ability';

type Errors = immutable.Immutable<{
  [key: string]: string;
}>;

interface EditorState {
  _record?: any;
  errors: Errors;
  disabled?: boolean;
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

function sortByAfter<T extends { path: string; after?: string }>(items: T[]): T[] {
  let paths: string[] = _.map(items, (item) => item.path);
  let map: ObjectMap<T> = {};
  for (let item of items) {
    map[item.path] = item;
    if (item.after && paths.indexOf(item.after) > -1) {
      let selfIndex = paths.indexOf(item.path);
      let afterIndex = paths.indexOf(item.after);
      paths.splice(
        afterIndex < selfIndex ? afterIndex + 1 : afterIndex,
        0,
        paths.splice(selfIndex, 1)[0]
      );
    }
  }
  let list = [];
  for (let path of paths) {
    list.push(map[path]);
  }
  return list;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);
    this.state = {
      errors: immutable({})
    };
  }

  static getDerivedStateFromProps(nextProps: EditorProps, prevState: EditorState) {
    const { model, record } = nextProps;
    const isNew = !record.id;
    const nextState: Partial<EditorState> = {
      disabled: nextProps.disabled || (isNew && model.nocreate) || (!isNew && model.noupdate)
    };
    if (!nextState.disabled) {
      let ability = nextProps.model.id + (isNew ? '.create' : '.update');
      nextState.disabled = !hasAbility(ability, isNew ? null : record);
    }
    const { errors: stateError } = prevState;
    if (nextProps.record !== prevState._record) {
      nextState.errors = checkErrors(nextProps, stateError);
    }
    return nextState;
  }

  handleFieldChange = (key: string, value: any) => {
    let { record, onChange } = this.props;
    onChange(record.set(key, value));
  };

  renderGroups() {
    let { model, record, embedded } = this.props;
    let { errors, disabled } = this.state;
    let groups: ObjectMap<FieldGroupProps> = {
      default: {
        embedded,
        title: '',
        fields: [],
        path: 'default',
        model,
        record,
        errors,
        onFieldChange: this.handleFieldChange
      }
    };

    _.forEach(model.groups, (group, key: string) => {
      groups[key] = _.assign({ path: key }, group, {
        fields: [],
        embedded,
        model,
        record,
        errors,
        onFieldChange: this.handleFieldChange
      });
      if (disabled === true) {
        groups[key].disabled = true;
      }
    });

    _.forEach(model.fields, (field) => {
      if (!field.group || !groups[field.group]) {
        groups.default.fields.push(field);
      } else {
        groups[field.group].fields.push(field);
      }
    });

    _.forEach(groups, (group: FieldGroupProps) => {
      group.fields = sortByAfter(group.fields);
    });

    return sortByAfter(_.values(groups)).map((group) => <FieldGroup key={group.path} {...group} />);
  }

  render() {
    return (
      <Node
        wrapper="Editor"
        props={this.props}
        className={`editor${this.props.embedded ? ' embedded' : ''}`}
      >
        {this.renderGroups()}
      </Node>
    );
  }
}
