//@flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import type { Props } from 'alaska-admin-view/views/FilterTool';
import Node from './Node';

const CHECK_ICON = <i className="fa fa-check" />;

export default class FilterTool extends React.Component<Props> {
  static contextTypes = {
    t: PropTypes.func,
    settings: PropTypes.object
  };

  handleSelect = (key: string) => {
    let { filters, onChange } = this.props;
    if (filters.hasOwnProperty(key)) {
      filters = _.omit(filters, key);
    } else {
      filters = _.assign({ key: null }, filters);
    }
    onChange(filters);
  };

  render() {
    const { settings, t } = this.context;
    const { model, filters } = this.props;
    let items = _.map(model.fields, (field) => {
      if (field.hidden || !field.filter) return false;
      if (field.super && !settings.superMode) return false;
      let icon = filters.hasOwnProperty(field.path) ? CHECK_ICON : null;
      return (
        <MenuItem
          key={field.path}
          eventKey={field.path}
          className="with-icon"
        >{icon} {t(field.label, model.serviceId)}</MenuItem>
      );
    }).filter(_.identity);
    return (
      <Node
        tag={DropdownButton}
        id="filter-tool"
        title={<i className="fa fa-filter" />}
        onSelect={this.handleSelect}
      >{items}
      </Node>
    );
  }
}
