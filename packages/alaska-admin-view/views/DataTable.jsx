// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import DataTableRow from './DataTableRow';

type Props = {
  model: Alaska$view$Model,
  columns?: string[],
  selected?: Alaska$view$Record[],
  records?: Alaska$view$Record[],
  sort?: string,
  onSort?: Function,
  onSelect?: Function,
  onRemove?: Function
};

type State = {
  records: Alaska$view$Record[],
  columns: Object[],
  selected: {}
};

export default class DataTable extends React.Component<Props, State> {
  static contextTypes = {
    router: PropTypes.object,
    settings: PropTypes.object,
    views: PropTypes.object,
    t: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      records: props.records || [],
      selected: {},
      columns: []
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  shouldComponentUpdate(props: Props, state: State) {
    if (!state.records || !state.columns) {
      return false;
    }
    return !shallowEqualWithout(state, this.state);
  }

  init(props: Props) {
    let model = props.model || this.props.model;
    if (!model) return;
    const { settings } = this.context;

    let state = {};
    if (props.records) {
      state.records = props.records;
    }
    if (props.selected) {
      state.selected = _.reduce(props.selected, (res, record) => {
        res[record._id] = true;
        return res;
      }, {});
    }

    let columns = [];
    _.forEach(props.columns || model.defaultColumns, (key) => {
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

  isAllSelected() {
    const { records, selected } = this.state;
    if (!records || !records.length) {
      return false;
    }
    for (let record of records) {
      if (!selected[record._id]) return false;
    }
    return true;
  }

  handleSelectAll = () => {
    let records = [];
    if (!this.isAllSelected()) {
      records = _.clone(this.state.records);
    }
    if (this.props.onSelect) {
      this.props.onSelect(records);
    }
  };
  handleSelect = (record: Object, isSelected: boolean) => {
    let selected = _.clone(this.state.selected);
    if (isSelected) {
      selected[record._id] = true;
    } else {
      delete selected[record._id];
    }
    this.setState({ selected });
    let records = _.filter(this.state.records, (r) => selected[r._id]);
    if (this.props.onSelect) {
      this.props.onSelect(records);
    }
  };
  handleEdit = (record: Object) => {
    const { model } = this.props;
    const { router } = this.context;
    let url = '/edit/' + model.serviceId + '/' + model.name + '/' + encodeURIComponent(record._id);
    router.push(url);
  };

  render() {
    const {
      model, sort, onSort, onSelect, onRemove
    } = this.props;
    const { t } = this.context;
    const { columns, records, selected } = this.state;
    if (!model || !columns) {
      return <div className="loading">Loading...</div>;
    }

    let className = 'data-table table table-hover ' + model.serviceId + '-' + model.id + '-record';

    let selectEl = onSelect ?
      <th onClick={this.handleSelectAll} width="29"><input type="checkbox" checked={this.isAllSelected()} />
      </th> : null;
    return (
      <table className={className}>
        <thead>
          <tr>
            {selectEl}
            {
              columns.map((col) => {
                let sortIcon = null;
                let handleClick;
                if (!col.nosort && onSort) {
                  if (col.key === sort) {
                    sortIcon = <i className="fa fa-sort-asc" />;
                    handleClick = () => onSort('-' + col.key);
                  } else if ('-' + col.key === sort) {
                    sortIcon = <i className="fa fa-sort-desc" />;
                    handleClick = () => onSort(col.key);
                  } else {
                    handleClick = () => onSort('-' + col.key);
                  }
                }
                return (<th
                  key={col.field.path}
                  onClick={handleClick}
                >{t(col.field.label, model.serviceId)}{sortIcon}
                </th>);
              })
            }
            <th />
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (<DataTableRow
            key={record._id || index}
            record={record}
            columns={columns}
            model={model}
            onEdit={this.handleEdit}
            onSelect={onSelect ? this.handleSelect : null}
            onRemove={onRemove}
            selected={selected[record._id]}
          />))}
        </tbody>
      </table>
    );
  }
}
