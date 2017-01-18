/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-03
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import { Link } from 'react-router';
import { IF, ELSE } from 'jsx-plus';
import shallowEqual from '../utils/shallow-equal';
import Node from './Node';
import DataTableRow from './DataTableRow';
import _filter from 'lodash/filter';
import _clone from 'lodash/clone';
import _reduce from 'lodash/reduce';

const { object, array, string, func } = React.PropTypes;

export default class DataTable extends React.Component {

  static propTypes = {
    model: object,
    columns: array,
    selected: array,
    data: array,
    sort: string,
    onSort: func,
    onSelect: func,
    onRemove: func
  };

  static contextTypes = {
    router: object,
    settings: object,
    views: object,
    t: func,
  };

  constructor(props, context) {
    super(props);
    this.state = {
      data: props.data || [],
      selected: {}
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  init(props) {
    let model = props.model || this.props.model;
    if (!model) return;
    const { settings } = this.context;

    let state = {};
    if (props.data) {
      state.data = props.data;
    }
    if (props.selected) {
      state.selected = _reduce(props.selected, (res, record) => {
        res[record._id] = true;
        return res;
      }, {});
    }

    let columns = [];
    (props.columns || model.defaultColumns).forEach(key => {
      let field = model.fields[key];
      if (field) {
        if (field.super && !settings.superMode) return;
        columns.push({
          key,
          field
        });
      }
    });
    state.columns = columns;
    this.setState(state);
  }

  shouldComponentUpdate(props, state) {
    if (!state.data || !state.columns) {
      return false;
    }
    return !shallowEqual(state, this.state);
  }

  handleSelect = (record, isSelected) => {
    let selected = _clone(this.state.selected);
    if (isSelected) {
      selected[record._id] = true;
    } else {
      delete selected[record._id];
    }
    this.setState({ selected });
    let records = _filter(this.state.data, record => selected[record._id]);
    this.props.onSelect(records);
  };

  handleSelectAll = () => {
    let records = [];
    if (!this.isAllSelected()) {
      records = _clone(this.state.data);
    }
    this.props.onSelect(records);
  };

  isAllSelected() {
    const { data, selected } = this.state;
    if (!data || !data.length) {
      return false;
    }
    for (let record of data) {
      if (!selected[record._id]) return false;
    }
    return true;
  };

  handleEdit = (record) => {
    const { model } = this.props;
    const { router } = this.context;
    const service = model.service;
    let url = '/edit/' + service.id + '/' + model.name + '/' + record._id;
    router.push(url);
  };

  render() {
    const { model, sort, onSort, onSelect, onRemove } = this.props;
    const { t } = this.context;
    const { columns, data, selected } = this.state;
    if (!model || !columns) {
      return <div className="loading">Loading...</div>;
    }
    const service = model.service;

    let selectEl = onSelect ?
      <th onClick={this.handleSelectAll} width="29"><input type="checkbox" checked={this.isAllSelected()}/></th> : null;

    return (
      <table className="data-table table table-hover">
        <thead>
        <tr>
          {selectEl}
          {
            columns.map(col => {
              let sortIcon = null;
              let handleClick;
              if (!col.nosort && onSort) {
                if (col.key === sort) {
                  sortIcon = <i className="fa fa-sort-asc"/>;
                  handleClick = () => onSort('-' + col.key);
                } else if ('-' + col.key === sort) {
                  sortIcon = <i className="fa fa-sort-desc"/>;
                  handleClick = () => onSort(col.key);
                } else {
                  handleClick = () => onSort('-' + col.key);
                }
              }
              return <th
                key={col.field.path}
                onClick={handleClick}
              >{t(col.field.label, service.id)}{sortIcon}</th>;
            })
          }
          <th></th>
        </tr>
        </thead>
        <tbody>
        {data.map((record, index) => <DataTableRow
          key={index}
          record={record}
          columns={columns}
          model={model}
          onEdit={this.handleEdit}
          onSelect={onSelect?this.handleSelect:null}
          onRemove={onRemove}
          selected={selected[record._id]}
        />)}
        </tbody>
      </table>
    );
  }
}
