/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-25
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import { connect } from 'react-redux';
import qs from 'qs';
import DataTable from './DataTable';

const { object, string, func } = React.PropTypes;

class Relationship extends React.Component {

  static propTypes = {
    actions: object,
    filters: object,
    lists: object,
    service: string,
    model: string,
    path: string,
    from: string,
    title: string,
  };

  static contextTypes = {
    actions: object,
    settings: object,
    t: func,
  };

  constructor(props) {
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

  componentWillReceiveProps(props) {
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

  shouldComponentUpdate(props, state) {
    return state.data != this.state.data || state.model != this.state.model;
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
      key: model.key
    };
    let filters = args.filters = Object.assign({}, this.props.filters, {
      [this.props.path]: this.props.from
    });
    this.setState({ model, filters }, () => {
      if (!this.state.data) {
        this.context.actions.list(args);
      }
    });
  }

  render() {
    let { model, data, filters } = this.state;
    if (!model || !data) {
      return <div></div>;
    }
    const t = this.context.t;
    let title = this.props.title ? t(this.props.title, model.service.id) : t('Relationship') + `: ${t(model.label, model.service.id)}`;
    let filtersString = qs.stringify({ filters });
    return (
      <div className="panel panel-default relationship-panel">
        <div className="panel-heading">
          <h3 className="panel-title">{title} <a className="relationship-more"
                                                 href={`#/list/${model.service.id}/${model.name}?${filtersString}`}>{t('More')}</a>
          </h3>
        </div>
        <div className="inner"><DataTable model={model} data={data}/></div>
      </div>
    );
  }
}

export default connect(({ lists }) => ({ lists }))(Relationship);
