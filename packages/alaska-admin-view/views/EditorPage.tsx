import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import * as checkDepends from 'check-depends';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Node from './Node';
import EditorToolBar from './EditorToolbar';
import Relationship from './Relationship';
import EditorActionBar from './EditorActionBar';
import Editor from './Editor';
import LoadingPage from './LoadingPage';
import * as detailsRedux from '../redux/details';
import {
  EditorPageProps,
  Model,
  State,
  DetailsState,
  Service,
  Record,
  ModelRelationship
} from '..';

interface EditorPageState {
  model: Model | null;
  record: immutable.Immutable<Record> | null;
  isNew: boolean;
  id: string;
}

interface Props extends EditorPageProps {
  details: DetailsState;
  services: {
    [serviceId: string]: Service;
  };
  loadDetails: Function;
}

class EditorPage extends React.Component<Props, EditorPageState> {
  loading: boolean;

  constructor(props: Props) {
    super(props);
    let { id } = props.match.params;
    this.state = {
      id,
      model: null,
      record: immutable({}),
      isNew: id === '_new'
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    let { match } = this.props;
    if (match.params.id !== nextProps.match.params.id) {
      this.setState({ record: immutable({}) }, () => {
        this.init(nextProps);
      });
    } else {
      this.init(nextProps);
    }
  }

  init(props: Props) {
    const { services, match, details, loadDetails } = props;
    let { service: serviceId, model: modelName, id } = match.params;
    let { record, model } = this.state;
    let nextState = { record, id, model, isNew: id === '_new' } as EditorPageState;
    let serviceModels: Service = services[serviceId];
    if (serviceModels && serviceModels.models) {
      nextState.model = serviceModels.models[modelName] || null;
    }
    if (nextState.model) {
      if (nextState.isNew) {
        if (!record) {
          record = immutable({});
          nextState.record = immutable({});
        }
        _.forEach(nextState.model.fields, (filed) => {
          if (typeof record[filed.path] !== 'undefined') {
            nextState.record = nextState.record.set(filed.path, record[filed.path]);
          } else if (typeof filed.default !== 'undefined') {
            nextState.record = nextState.record.set(filed.path, filed.default);
          }
        });
      } else {
        let serviceRecords = details[nextState.model.id];
        if (serviceRecords) {
          nextState.record = serviceRecords[id];
        } else {
          nextState.record = null;
        }
        if (!nextState.record) {
          loadDetails({ model: nextState.model.id, id });
        }
      }
    }
    this.setState(nextState);
  }

  handleChange = (label: string, value: any) => {
    let { record } = this.state;
    let newRecord = record.set(label, value);
    this.setState({ record: newRecord });
  }

  lookupModel(modelRef: string): Model | null {
    let { services } = this.props;
    let model = null;
    _.forEach(services, (service) => {
      _.forEach(service.models, (m) => {
        if (m.modelName === modelRef || m.id === modelRef) {
          model = m;
        }
      });
    });
    return model;
  }

  renderError() {
    const { model, record } = this.state;
    return (
      <div className="error-info">
        <div className="error-title">{tr('Error', model.serviceId)}</div>
        <div className="error-desc">{tr(record._error, model.serviceId)}&nbsp;
          <Link
            to={`/edit/${model.serviceId}/${model.modelName}/_new`}
          >
            {tr('Create', model.serviceId)}
          </Link>
        </div>
      </div>
    );
  }

  renderRelationships() {
    const { isNew, id, model, record } = this.state;
    if (isNew) return null;
    return _(model.relationships)
      .filter((rel) => !checkDepends(rel.hidden, record))
      .map((r: ModelRelationship, key: string) => (<Relationship
        key={key}
        from={id}
        path={r.path}
        model={this.lookupModel(r.ref)}
        title={r.title}
      />))
      .value();
  }

  render() {
    const { model, record, isNew } = this.state;
    if (!model) {
      return null;
    }
    if (!record) {
      return <LoadingPage />;
    }

    let el = <Editor isNew={isNew} model={model} record={record} onChange={this.handleChange} />;
    let error = false;
    if (!record || (record && record._error)) {
      el = this.renderError();
      error = true;
    }
    let editorTitle = record[model.titleField] || String(record._id);
    if (isNew) {
      editorTitle = tr('Create', model.serviceId);
    }

    let className = [
      'editor-page',
      model.serviceId + '-' + model.id,
      model.canCreate ? 'can-create' : 'no-create',
      model.canUpdate ? 'can-update' : 'no-update',
      model.canRemove ? 'can-remove' : 'no-remove',
    ].join(' ');

    return (
      <Node
        wrapper="EditorPage"
        props={this.props}
        className={className}
      >
        <EditorToolBar>
          <Link
            to={`/list/${model.serviceId}/${model.modelName}`}
          >{tr(model.label, model.serviceId)}
          </Link>&nbsp;{'>'}&nbsp;
          {editorTitle}
        </EditorToolBar>
        {el}
        {!error && this.renderRelationships()}
        {
          !error && <EditorActionBar
            model={model}
            record={record}
            isNew={isNew}
          />
        }
      </Node>
    );
  }
}

export default connect(
  ({ details, settings }: State) => ({ details, services: settings.services }),
  (dispatch) => bindActionCreators({
    loadDetails: detailsRedux.loadDetails
  }, dispatch)
)(EditorPage);
