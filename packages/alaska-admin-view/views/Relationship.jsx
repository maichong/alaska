// @flow

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import qs from 'qs';
import DataTable from './DataTable';
import * as listRedux from '../redux/lists';

const { object, func } = React.PropTypes;

class Relationship extends React.Component {

  static contextTypes = {
    actions: object,
    settings: object,
    t: func,
  };

  props: {
    actions: Object,
    filters: Object,
    lists: Object,
    service: string,
    model: string,
    path: string,
    from: string,
    title: string,
  };

  state: Object;

  constructor(props: Object) {
    super(props);
    this.state = {
      data: null,
      model: null,
      filters: {}
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(props: Object) {
    let model = this.state.model;
    if (props.from !== this.props.from) {
      this.setState({
        data: null
      }, () => {
        this.init();
      });
    }
    if (props.lists && props.lists[model.key] !== this.props.lists[model.key]) {
      let list = props.lists[model.key];
      this.setState({
        data: list ? list.results : null
      }, () => {
        this.init();
      });
    }
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return state.data !== this.state.data || state.model !== this.state.model;
  }

  init() {
    let serviceId = this.props.service;
    let modelName = this.props.model;
    let model = this.context.settings.services[serviceId].models[modelName];
    if (!model) return;
    let list = this.props.lists[model.key];
    if (list && model === this.state.model && this.state.data) return;
    let args = {
      service: serviceId,
      model: modelName,
      key: model.key,
    };
    // $Flow
    let filters = args.filters = Object.assign({}, this.props.filters, {
      [this.props.path]: this.props.from
    });
    this.setState({ model, filters }, () => {
      if (!this.state.data) {
        this.props.listAction(args);
      }
    });
  }

  render() {
    let { model, data, filters } = this.state;
    if (!model || !data) {
      return <div />;
    }
    const t = this.context.t;
    let title = this.props.title ? t(this.props.title, model.serviceId)
      : t('Relationship') + `: ${t(model.label, model.serviceId)}`;
    let filtersString = qs.stringify({ filters });
    return (
      <div className="panel panel-default relationship-panel">
        <div className="panel-heading">
          <h3 className="panel-title">{title}
            <a
              className="relationship-more"
              href={`#/list/${model.serviceId}/${model.name}?${filtersString}`}
            >{t('More')}</a>
          </h3>
        </div>
        <div className="inner"><DataTable model={model} data={data} /></div>
      </div>
    );
  }
}

export default connect(({ lists }) => ({ lists }), (dispatch) => bindActionCreators({
  listAction: listRedux.list
}, dispatch))(Relationship);
