// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import type { Props } from 'alaska-admin-view/views/FilterEditor';

export default class FilterEditor extends React.Component<Props> {
  static contextTypes = {
    t: PropTypes.func,
    views: PropTypes.object
  };

  handleChange(path: string, v: string) {
    this.props.onChange(_.assign({}, this.props.value, { [path]: v }));
  }

  handleClose(path: string) {
    this.props.onChange(_.omit(this.props.value, path));
  }

  render() {
    const { model, value } = this.props;
    const { views, t } = this.context;
    return (
      <div className="filter-editor form-horizontal">{
        _.map(value, (filterValue, path) => {
          let field = model.fields[path];
          if (!field) return null;
          let FilterView = views[field.filter];
          if (!FilterView) return null;
          let className = model.id + '-' + field.path + '-filter row field-filter';
          let cfg = _.assign({}, field, {
            label: t(field.label, model.serviceId)
          });
          return (
            <FilterView
              key={path}
              className={className}
              field={cfg}
              value={filterValue}
              onChange={(v) => this.handleChange(path, v)}
              onClose={() => this.handleClose(path)}
            />
          );
        })
      }
      </div>
    );
  }
}
