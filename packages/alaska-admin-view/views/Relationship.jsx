// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import qs from 'qs';
import type { ImmutableArray } from 'seamless-immutable';
import DataTable from './DataTable';
import Node from './Node';
import * as listRedux from '../redux/lists';

type Props = {
  loadList: Function,
  filters: Object,
  lists: ImmutableObject<Alaska$view$lists>,
  service: string,
  model: string,
  path: string,
  from: string,
  title: string,
};

type State = {
  records: ImmutableArray<Alaska$view$Record> | null,
  filters: {},
  model: Alaska$view$Model | null
};

class Relationship extends React.Component<Props, State> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      records: null,
      filters: {},
      model: null
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(props: Props) {
    let { service, model: modelName, lists } = props;
    if (props.from !== this.props.from || service !== this.props.service || modelName !== this.props.model) {
      this.setState({ records: null }, () => {
        this.init();
      });
      return;
    }
    let model = this.context.settings.services[service].models[props.model];
    if (!model) return;
    if (lists[model.key] !== this.props.lists[model.key]) {
      let list = lists[model.key];
      this.setState({ records: list ? list.results : null }, () => {
        this.init();
      });
    }
  }

  shouldComponentUpdate(props: Props, state: State) {
    return state.records !== this.state.records;
  }

  init() {
    let serviceId = this.props.service;
    let modelName = this.props.model;
    let model = this.context.settings.services[serviceId].models[modelName];
    if (!model) return;
    let list = this.props.lists[model.key];
    if (list && this.state.records) return;
    // $Flow
    let filters = Object.assign({}, this.props.filters, { [this.props.path]: this.props.from });
    let args = {
      service: serviceId,
      model: modelName,
      key: model.key,
      filters
    };
    this.setState({ filters, model }, () => {
      if (!this.state.records) {
        this.props.loadList(args);
      }
    });
  }

  render() {
    let { records, filters, model } = this.state;
    if (!model || !records) {
      return null;
    }
    const { t } = this.context;
    let title = this.props.title ? t(this.props.title, model.serviceId)
      : t('Relationship') + `: ${t(model.label, model.serviceId)}`;
    let filtersString = qs.stringify({ filters });
    return (
      <Node wrapper="relationship" className="panel panel-default relationship-panel">
        <div className="panel-heading">
          <h3 className="panel-title">{title}
            <a
              className="relationship-more"
              href={`#/list/${model.serviceId}/${model.modelName}?${filtersString}`}
            >{t('More')}
            </a>
          </h3>
        </div>
        <div className="inner"><DataTable model={model} records={records} /></div>
      </Node>
    );
  }
}

export default connect(
  ({ lists }) => ({ lists }),
  (dispatch) => bindActionCreators({ loadList: listRedux.loadList }, dispatch)
)(Relationship);
