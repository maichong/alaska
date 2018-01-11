// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import Checkbox from 'alaska-field-checkbox/views/Checkbox';
import Immutable from 'seamless-immutable';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import DataTableRow from './DataTableRow';
import Node from './Node';

type Props = {
  model: Alaska$view$Model,
  columns?: string[],
  selected?: ImmutableArray<Alaska$view$Record>,
  records: ImmutableArray<Alaska$view$Record>,
  activated?: ImmutableObject<Alaska$view$Record>,
  sort?: string,
  onSort?: Function,
  onActive?: Function,
  onSelect?: Function,
  onRemove?: Function
};

type State = {
  columnList: Alaska$view$Field[],
  selectedIdMap: {}
};

export default class DataTable extends React.Component<Props, State> {
  static contextTypes = {
    router: PropTypes.object,
    settings: PropTypes.object,
    views: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIdMap: {},
      columnList: []
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  shouldComponentUpdate(nextProps: Props, state: State) {
    if (!state.columnList) {
      return false;
    }
    return !shallowEqualWithout(state, this.state) || nextProps.records !== this.props.records;
  }

  init(props: Props) {
    let model = props.model;
    if (!model) return;
    const { settings } = this.context;

    let state = {};
    if (props.selected) {
      state.selectedIdMap = _.reduce(props.selected, (res, record) => {
        res[record._id] = true;
        return res;
      }, {});
    }

    let columnList = [];
    _.forEach(props.columns || model.defaultColumns, (key) => {
      let field = model.fields[key];
      if (field) {
        if (!settings.superMode && field.super) return;
        columnList.push(field);
      }
    });
    state.columnList = columnList;
    this.setState(state);
  }

  isAllSelected() {
    const { records } = this.props;
    const { selectedIdMap } = this.state;
    if (!records || !records.length) {
      return false;
    }
    for (let record of records) {
      if (!selectedIdMap[record._id]) return false;
    }
    return true;
  }

  handleSelectAll = () => {
    const { onSelect, records } = this.props;
    if (!onSelect) return;
    if (this.isAllSelected()) {
      onSelect(Immutable([]));
    } else {
      onSelect(records);
    }
  };

  handleSelect = (record: Object, isSelected: boolean) => {
    let selectedIdMap = _.clone(this.state.selectedIdMap);
    if (isSelected) {
      selectedIdMap[record._id] = true;
    } else {
      delete selectedIdMap[record._id];
    }
    this.setState({ selectedIdMap });
    let records = Immutable(_.filter(this.props.records, (r) => selectedIdMap[r._id]));
    if (this.props.onSelect) {
      this.props.onSelect(records);
    }
  };

  handleEdit = (record: Object) => {
    const { model } = this.props;
    const { history } = this.context.router;
    let url = '/edit/' + model.serviceId + '/' + model.modelName + '/' + encodeURIComponent(record._id);
    history.push(url);
  };

  render() {
    const {
      model, records, activated, selected, sort, onSort, onSelect, onRemove, onActive
    } = this.props;
    const { t } = this.context;
    const { columnList, selectedIdMap } = this.state;
    if (!model || !columnList) {
      return <div className="loading">Loading...</div>;
    }

    let className = 'data-table table table-hover ' + model.serviceId + '-' + model.id + '-record';

    let selectEl = onSelect ?
      <Node
        tag="th"
        wrapper="dataTableSelect"
        props={{
          model, records, selected, selectedIdMap
        }}
        onClick={this.handleSelectAll}
        width="29"
      >
        <Checkbox value={this.isAllSelected()} />
      </Node> : null;
    return (
      <Node tag="table" wrapper="dataTable" className={className}>
        <thead>
          <Node
            wrapper="dataTableHeader"
            tag="tr"
            props={{
              model, records, selected, selectedIdMap
            }}
          >
            {selectEl}
            {
              columnList.map((field) => {
                let sortIcon = null;
                let handleClick;
                if (!field.nosort && onSort) {
                  if (field.path === sort) {
                    sortIcon = <i className="fa fa-sort-asc" />;
                    handleClick = () => onSort('-' + field.path);
                  } else if ('-' + field.path === sort) {
                    sortIcon = <i className="fa fa-sort-desc" />;
                    handleClick = () => onSort(field.path);
                  } else {
                    handleClick = () => onSort('-' + field.path);
                  }
                }
                return (<th
                  key={field.path}
                  onClick={handleClick}
                >{t(field.label, model.serviceId)}{sortIcon}
                </th>);
              })
            }
            <th />
          </Node>
        </thead>
        <tbody>
          {_.map(records, (record: Alaska$view$Record, index: number) => (<DataTableRow
            key={record._id || index}
            record={record}
            active={activated === record}
            selected={selectedIdMap[record._id] || false}
            columnList={columnList}
            model={model}
            onEdit={this.handleEdit}
            onSelect={onSelect ? this.handleSelect : null}
            onActive={onActive ? () => onActive(record) : undefined}
            onRemove={onRemove}
          />))}
        </tbody>
      </Node>
    );
  }
}
