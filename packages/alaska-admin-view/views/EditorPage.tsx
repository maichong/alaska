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
  ModelRelationship,
  ActionState
} from '..';

interface Props extends EditorPageProps {
  action: ActionState;
  details: DetailsState;
  models: ObjectMap<Model>;
  loadDetails: Function;
}

interface EditorPageState {
  model: Model | null;
  _record?: immutable.Immutable<Record> | null;
  record: immutable.Immutable<Record> | null;
  isNew: boolean;
  id: string;
  _action: ActionState;
}

class EditorPage extends React.Component<Props, EditorPageState> {
  loading: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {
      _action: props.action,
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

    const { action } = nextProps;

    const nextState: Partial<EditorPageState> = {
      _action: action,
      id: params.id,
      isNew: params.id === '_new'
    };
    if (model && (!prevState.model || prevState.model !== model)) {
      nextState.model = model;
    }

    if (nextState.isNew) {
      // 新建
      if (!prevState.record // 页面刚刚初始化， record 还是 null
        || prevState.record.id || // 从编辑页面跳转到了新建页面
        (prevState.model && prevState.model.id !== model.id) // 从另外一个模型的新建页面跳转而来
      ) {
        let defatuls: any = { isNew: true };
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

      // 自定义Action完成后，刷新数据
      if (
        prevState._action !== action
        && action.action
        && !['create', 'update', 'remove'].includes(action.action)
        && !action.fetching
        && !action.error
      ) {
        nextState.record = null;
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
    let modelId = modelRef.indexOf('.') > -1 ? modelRef : `${match.params.service}.${modelRef}`;
    return models[modelId] || null;
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

  renderLayout(content: React.ReactNode) {
    const { model, record, isNew } = this.state;

    let className = [
      'editor-page',
      `${model.serviceId}-${model.id}`,
      model.canCreate ? 'can-create' : 'no-create',
      model.canUpdate ? 'can-update' : 'no-update',
      model.canRemove ? 'can-remove' : 'no-remove',
    ].join(' ');

    let editorTitle = record ? (record[model.titleField] || String(record._id)) : '';
    if (isNew) {
      editorTitle = tr('Create', model.serviceId);
    }

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
        {content}
        <EditorActionBar
          model={model}
          record={record}
        />
      </Node>
    );
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

  render() {
    const { model, record, isNew } = this.state;
    if (!model) {
      return <LoadingPage />;
    }

    if (!record) {
      return this.renderLayout(<LoadingPage />);
    }

    let el;
    if (record && record._error) {
      el = this.renderError();
    } else {
      el = <div>
        <Editor model={model} record={record} onChange={this.handleChange} />
        {this.renderRelationships()}
      </div>;
    }

    return this.renderLayout(el);
  }
}

export default connect(
  ({ details, settings, action }: StoreState) => ({ details, models: settings.models, action }),
  (dispatch) => bindActionCreators({
    loadDetails: detailsRedux.loadDetails
  }, dispatch)
)(EditorPage);
