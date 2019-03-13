import { ObjectMap } from 'alaska';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import { ErrorsMap } from '@samoyed/types';
import Node from './Node';
import { EditorProps, FieldGroupProps } from '..';
import FieldGroup from './FieldGroup';
import { hasAbility } from '../utils/check-ability';

type Errors = immutable.Immutable<ErrorsMap>;

interface EditorState {
  _record?: any;
  disabled?: boolean;
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
  errorCheckers: ObjectMap<boolean>;

  constructor(props: EditorProps) {
    super(props);
    this.state = {
    };
    this.errorCheckers = {};
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
    // const { errors: stateError } = prevState;
    // if (nextProps.record !== prevState._record) {
    //   nextState.errors = checkErrors(nextProps, stateError);
    // }
    return nextState;
  }

  componentDidMount() {
    this._checkErrors();
  }

  componentDidUpdate() {
    this._checkErrors();
  }

  _checkErrors() {
    const { record, errors, onChange } = this.props;
    let newErrors = this._getErrors(errors);
    if (errors !== newErrors) {
      onChange(record, newErrors);
    }
  }

  _getErrors(errors: immutable.Immutable<ErrorsMap> | null): Errors | null {
    let { model, record } = this.props;
    errors = errors || immutable({});
    _.forEach(model.fields, (field, key) => {
      if (this.errorCheckers[key] === true) {
        // Field有自定义检查器
        return;
      }
      if (field.required && !record[key]) {
        let value = tr('This field is required!');
        if (errors[key] !== value) {
          errors = errors.set(key, value);
        }
      } else if (field.required && typeof record[key] === 'object' && !_.size(record[key])) {
        let value = tr('This field is required!');
        if (errors[key] !== value) {
          errors = errors.set(key, value);
        }
      } else if (errors[key]) {
        errors = errors.without(key);
      }
    });
    if (_.isEmpty(errors)) return null;
    return errors;
  }

  handleFieldChange = (key: string, value: any, error?: Errors) => {
    let { record, onChange, errors } = this.props;
    if (typeof error !== 'undefined') {
      this.errorCheckers[key] = true;
      errors = errors || immutable({});
      if (error) {
        errors = errors.set(key, error);
      } else if (errors[key]) {
        errors = errors.without(key);
      }
    } else {
      this.errorCheckers[key] = false;
    }
    onChange(record.set(key, value), this._getErrors(errors));
  };

  renderGroups() {
    let { model, record, embedded, errors } = this.props;
    let { disabled } = this.state;
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
