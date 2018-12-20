import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
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
import { ObjectMap } from 'alaska';
import checkAbility from '../utils/check-ability';
import {
  EditorPageProps,
  Model,
  StoreState,
  DetailsState,
  Record,
  ModelRelationship
} from '..';

interface EditorPageState {
  model: Model | null;
  _record?: immutable.Immutable<Record> | null;
  record: immutable.Immutable<Record> | null;
  isNew: boolean;
  id: string;
}

interface Props extends EditorPageProps {
  details: DetailsState;
  models: ObjectMap<Model>;
  loadDetails: Function;
}

class EditorPage extends React.Component<Props, EditorPageState> {
  loading: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      id: '_new',
      model: null,
      record: null,
      isNew: true
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: EditorPageState) {
    const { params } = nextProps.match;
    const modelId = `${params.service}.${params.model}`;
    const model = nextProps.models[modelId] || prevState.model;
    if (!model) return null;

    const nextState: Partial<EditorPageState> = {
      id: params.id,
      isNew: params.id === '_new'
    };
    if (model && (!prevState.model || prevState.model !== model)) {
      nextState.model = model;
    }

    if (nextState.isNew) {
      // 新建
      if (!prevState.record // 页面刚刚初始化， record 还是 null
        || prevState.record._id || // 从编辑页面跳转到了新建页面
        (prevState.model && prevState.model.id !== model.id) // 从另外一个模型的新建页面跳转而来
      ) {
        let defatuls: any = {};
        _.forEach(model.fields, (field, key) => {
          if (typeof field.default !== 'undefined') {
            defatuls[key] = field.default;
          }
        });
        nextState.record = immutable(defatuls);
      }
    } else {
      // 编辑
      let details = nextProps.details[modelId];
      let reduxRecord = details ? (details[params.id] || null) : null;
      nextState._record = reduxRecord;
      // 检查Redux数据变更
      if (prevState._record && reduxRecord && reduxRecord !== prevState._record) {
        // redux中数据更新了
        nextState.record = reduxRecord;
      } else if (!prevState.isNew && prevState.id !== nextState.id) {
        // 直接从一个一条记录跳转到另一条记录，强制加载一次
        nextState.record = null;
      } else if (!reduxRecord || !prevState.record) {
        nextState.record = reduxRecord;
      }
    }
    return nextState;
  }

  componentDidMount() {
    const { model, id, isNew } = this.state;
    if (!isNew) {
      this.props.loadDetails({ model: model.id, id });
    }
  }

  componentDidUpdate() {
    const { model, id, isNew, record } = this.state;
    if (!isNew && record === null) {
      this.props.loadDetails({ model: model.id, id });
    }
  }

  handleChange = (label: string, value: any) => {
    let { record } = this.state;
    let newRecord = record.set(label, value);
    this.setState({ record: newRecord });
  }

  lookupModel(modelRef: string): Model | null {
    let { models, match } = this.props;
    let modelId = modelRef.indexOf('.') > -1 ? modelRef : match.params.service + '.' + modelRef;
    return models[modelId] || null;
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
      .filter((rel) => !checkAbility(rel.hidden, record))
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
    if (!model || !record) {
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
  ({ details, settings }: StoreState) => ({ details, models: settings.models }),
  (dispatch) => bindActionCreators({
    loadDetails: detailsRedux.loadDetails
  }, dispatch)
)(EditorPage);
