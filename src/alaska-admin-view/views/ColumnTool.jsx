//@flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import type { Props } from 'alaska-admin-view/views/ColumnTool';
import Node from './Node';

const CHECK_ICON = <i className="fa fa-check" />;

export default class ColumnTool extends React.Component<Props> {
  static contextTypes = {
    t: PropTypes.func,
    settings: PropTypes.object
  };

  handleSelect = (key: string) => {
    let { model, columns, onChange } = this.props;
    if (!columns.length) {
      columns = model.defaultColumns;
    }
    if (columns.indexOf(key) > -1) {
      columns = _.without(columns, key);
    } else {
      columns = _.map(model.fields, (field) => {
        if (field.path === key || columns.indexOf(field.path) > -1) {
          return field.path;
        }
        return '';
      }).filter(_.identity);
    }
    onChange(columns);
  };

  render() {
    const { settings, t } = this.context;
    let { model, columns } = this.props;
    if (!columns.length) {
      columns = model.defaultColumns;
    }
    let items = _.map(model.fields, (field) => {
      if (field.hidden || !field.cell) return false;
      if (field.super && !settings.superMode) return false;
      let icon = columns.indexOf(field.path) > -1 ? CHECK_ICON : null;
      return (
        <MenuItem
          key={field.path}
          eventKey={field.path}
          className="with-icon"
        >{icon} {t(field.label, model.serviceId)}
        </MenuItem>
      );
    }).filter(_.identity);
    return (
      <Node
        tag={DropdownButton}
        id="filter-tool"
        title={<i className="fa fa-columns" />}
        onSelect={this.handleSelect}
      >{items}
      </Node>
    );
  }
}
