//@flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import type { Props } from 'alaska-admin-view/views/Editor';
import Node from './Node';
import FieldGroup from './FieldGroup';
import Loading from './Loading';

type State = {
  errors: Object
};

export default class Editor extends React.Component<Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  state = { errors: {} };

  componentWillReceiveProps(nextProps: Props) {
    const { errors } = this.state;
    const { record } = nextProps;
    for (let key in errors) {
      if (record[key]) {
        setTimeout(() => this.checkErrors());
        return;
      }
    }
  }

  groupRefs = {};

  get fieldRefs(): Object {
    let results = {};
    _.forEach(this.groupRefs, (groupDom) => {
      _.assign(results, groupDom.fieldRefs);
    });
    return results;
  }

  checkErrors(): Object {
    const { model, record } = this.props;
    let errors = {};
    const { t } = this.context;
    const fieldRefs = this.fieldRefs || {};
    _.forEach(model.fields, (field, key) => {
      // $Flow record 一定存在
      if (field.required && !record[key]) {
        errors[key] = t('This field is required!');
      } else if (fieldRefs[key] && fieldRefs[key].getError) {
        let error = fieldRefs[key].getError();
        if (error) {
          errors[key] = error;
        }
      }
    });
    this.setState({ errors });
    return errors;
  }

  handleFieldChange = (key: any, value: any) => {
    const { onChange, record } = this.props;
    onChange(record.set(key, value));
  };

  renderGroups() {
    const {
      model, record, recordId, disabled
    } = this.props;
    const { errors } = this.state;
    const isNew = recordId === '_new';
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
          isNew={isNew}
          record={record}
          errors={errors}
          disabled={disabled || false}
          onFieldChange={this.handleFieldChange}
          {...others}
        />
      ));
    }
    return groupElements;
  }

  render() {
    const {
      recordId,
      model,
      record
    } = this.props;
    const isNew = recordId === '_new';
    if (!record) {
      return <Loading />;
    }
    if (record._error) {
      return <div className="editor-error">{record._error}</div>;
    }
    return (
      <Node id="editor" props={this.props} state={this.state} className={model.serviceId + '-' + model.id}>
        {isNew ? null : <div className="top-toolbar-id visible-xs-block">ID : {recordId}</div>}
        {this.renderGroups()}
      </Node>
    );
  }
}
