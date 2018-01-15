//@flow

import _ from 'lodash';
import React from 'react';
import type { ImmutableObject } from 'seamless-immutable';
import Node from './Node';
import FieldGroup from './FieldGroup';
import type { FieldRefMap } from './FieldGroup';

type Props = {
  model: Alaska$view$Model,
  id: string,
  record: ImmutableObject<Alaska$view$Record>,
  loading?: boolean,
  errors?: {},
  onChange: Function
};

export default class Editor extends React.Component<Props> {
  groupRefs = {};

  get fieldRefs(): FieldRefMap {
    let results = {};
    _.forEach(this.groupRefs, (groupDom) => {
      _.assign(results, groupDom.fieldRefs);
    });
    return results;
  }

  handleFieldChange = (key: any, value: any) => {
    const { onChange, record } = this.props;
    onChange(record.set(key, value));
  };

  renderGroups() {
    const {
      model, record, id, errors, loading
    } = this.props;
    const isNew = id === '_new';
    let map = _.reduce(model.fields, (res: Object, f: Alaska$Field$options, path: string) => {
      res[path] = {
        path,
        after: f.after,
        afters: []
      };
      return res;
    }, {});

    let fieldPathsList = [];

    _.forEach(map, (f) => {
      if (f.after && map[f.after]) {
        map[f.after].afters.push(f);
      } else {
        fieldPathsList.push(f);
      }
    });

    let paths = [];

    function flat(f) {
      paths.push(f.path);
      f.afters.forEach(flat);
    }

    _.forEach(fieldPathsList, flat);

    let groups = {
      default: {
        title: '',
        fields: []
      }
    };

    for (let groupKey of Object.keys(model.groups)) {
      let group = _.clone(model.groups[groupKey]);
      // $Flow
      group.fields = [];
      groups[groupKey] = group;
    }

    for (let path of paths) {
      let field = model.fields[path];
      let group = groups.default;
      if (field.group && groups[field.group]) {
        group = groups[field.group];
      }
      group.fields.push(field);
    }

    const groupElements = [];
    for (let groupKey of Object.keys(groups)) {
      let group = groups[groupKey];
      if (!group.fields.length) {
        delete this.groupRefs[groupKey];
        continue;
      }
      const { fields, ...others } = group;
      groupElements.push((
        <FieldGroup
          key={groupKey}
          path={groupKey}
          ref={(r) => {
            this.groupRefs[groupKey] = r;
          }}
          model={model}
          fields={fields}
          id={id}
          isNew={isNew}
          record={record}
          errors={errors || {}}
          loading={loading || false}
          onFieldChange={this.handleFieldChange}
          {...others}
        />
      ));
    }
    return groupElements;
  }

  render() {
    const {
      id,
      model,
      record
    } = this.props;
    const isNew = id === '_new';
    if (!record) {
      return <div className="loading">Loading...</div>;
    }
    if (record._error) {
      return <div className="editor-error">{record._error}</div>;
    }
    return (
      <Node id="editor" props={this.props} state={this.state} className={model.serviceId + '-' + model.id}>
        {isNew ? null : <div className="top-toolbar-id visible-xs-block">ID : {id}</div>}
        {this.renderGroups()}
      </Node>
    );
  }
}
