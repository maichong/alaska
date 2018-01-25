//@flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import type { ImmutableArray } from 'seamless-immutable';
import type { Props } from 'alaska-admin-view/views/List';
import DataTable from './DataTable';
import Node from './Node';
import Loading from './Loading';
import * as listRedux from '../redux/lists';
import * as settingsRedux from '../redux/settings';

type FinalProps = Props & {
  loadList: Function,
  refreshSettings: Function,
  lists: Alaska$view$lists,
};

type State = {
  page: number,
  list?: Alaska$view$RecordList,
  records: null | ImmutableArray<Alaska$view$Record>
};

class List extends React.Component<FinalProps, State> {
  static defaultProps = {
    search: '',
    filters: {},
    sort: ''
  };

  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: FinalProps) {
    super(props);
    this.state = {
      page: 1,
      records: null
    };
  }

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: FinalProps) {
    this.init(nextProps);
  }

  init(props: FinalProps) {
    const { model, lists } = props;
    let nextState = {};
    let list = lists[model.key];
    if (list) {
      nextState.records = list.results;
    } else {
      nextState.records = null;
    }
    nextState.list = list;
    this.setState(nextState, () => {
      if (!nextState.records) {
        this.refresh();
      }
    });
  }

  refresh = () => {
    // $Flow
    this.setState({ page: 0 }, () => this.loadMore());
  };

  loadMore() {
    let { page, list } = this.state;
    let {
      filters, search, sort, model, loadList
    } = this.props;
    if (!model || (list && list.fetching)) return;
    page = (page || 0) + 1;
    loadList({
      service: model.serviceId, model: model.modelName, page, filters, search, key: model.key, sort
    });
    this.setState({ page });
  }

  renderEmpty() {
    const { model } = this.props;
    const { list } = this.state;
    const { t } = this.context;
    let link = null;

    if (!model || !list || list.fetching) return null;

    if (model.canCreate) {
      link = <Link to={`/edit/${model.serviceId}/${model.modelName}/_new`}>{t('Create')}</Link>;
    }
    return (
      <div className="error-info list-empty">
        <div className="error-info-title">{t('No data!')}</div>
        <div className="error-info-desc">
          {t('No records found.')} &nbsp; {link}
        </div>
      </div>
    );
  }

  render() {
    const {
      model, selected, activated, onActive, onSelect, onRemove, onSort, sort, columns
    } = this.props;
    const { records } = this.state;
    if (!records) return <Loading />;
    if (!records.length) return this.renderEmpty();
    return (
      <Node wrapper="list" className="panel panel-default noborder list-panel">
        <DataTable
          canDrag
          model={model}
          sort={sort}
          columns={columns}
          records={records}
          selected={selected}
          activated={activated}
          onSort={onSort}
          onSelect={onSelect}
          onActive={onActive}
          onRemove={onRemove}
        />
      </Node>
    );
  }
}

export default connect(({ lists }) => ({ lists }), (dispatch) => bindActionCreators({
  loadList: listRedux.loadList,
  refreshSettings: settingsRedux.refreshSettings
}, dispatch), null, {
  withRef: true
})(List);
