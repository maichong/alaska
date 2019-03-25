import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import * as qs from 'qs';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ErrorsMap } from '@samoyed/types';
import Node from './Node';
import EditorToolBar from './EditorToolbar';
import RelationshipPage from './RelationshipPage';
import EditorActionBar from './EditorActionBar';
import Editor from './Editor';
import LoadingPage from './LoadingPage';
import * as detailsRedux from '../redux/details';
import { ObjectMap } from 'alaska';
import {
  User,
  EditorPageProps,
  Model,
  StoreState,
  DetailsState,
  Record,
  ActionState
} from '..';

interface Props extends EditorPageProps {
  action: ActionState;
  details: DetailsState;
  models: ObjectMap<Model>;
  loadDetails: Function;
  user: User;
}

interface EditorPageState {
  model: Model | null;
  _record?: immutable.Immutable<Record> | null;
  record: immutable.Immutable<Record> | null;
  errors: immutable.Immutable<ErrorsMap> | null;
  isNew: boolean;
  id: string;
  _action: ActionState;
  tab: string;
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
      errors: null,
      isNew: true,
      tab: ''
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
        let init: any = { isNew: true };
        _.forEach(model.fields, (field, key) => {
          if (typeof field.default !== 'undefined') {
            init[key] = field.default;
          }
        });

        const { location, user } = nextProps;
        let queryString = (location.search || '').substr(1);
        let query = qs.parse(queryString) || {};
        _.forEach(query, (v, k) => {
          if (k[0] === '_') return;
          if (v === 'NOW' && model.fields[k] && model.fields[k].plainName === 'date') {
            v = new Date();
          } else if (v === 'SELF' && model.fields[k] && model.fields[k].model === 'alaska-user.User') {
            v = user.id;
          }
          init[k] = v;
        });

        nextState.record = immutable(init);
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

  handleChange = (record: immutable.Immutable<Record>, errors: immutable.Immutable<ErrorsMap>) => {
    this.setState({ record, errors });
  }

  handleTab = (t: string) => {
    this.setState({ tab: t });
  }

  renderLayout(content: React.ReactNode, hasActionBar: boolean) {
    const { model, record, isNew, tab } = this.state;

    let className = [
      'page',
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
        <div className="page-inner editor-page-inner">
          <EditorToolBar model={model} record={record} tab={tab} onChangeTab={this.handleTab}>
            <Link
              to={`/list/${model.serviceId}/${model.modelName}`}
            >{tr(model.label, model.serviceId)}
            </Link>&nbsp;{'>'}&nbsp;
            {editorTitle}
          </EditorToolBar>
          {content}
          {hasActionBar && <EditorActionBar model={model} record={record} />}
        </div>
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
    const { model, record, errors, tab, isNew } = this.state;
    if (!model) {
      return <LoadingPage />;
    }

    if (!record) {
      return this.renderLayout(<LoadingPage />, false);
    }

    let el;
    let relationship;
    if (record && record._error) {
      el = this.renderError();
    } else {
      relationship = !isNew && tab && _.find(model.relationships, (r) => r.key === tab);
      if (relationship) {
        el = <RelationshipPage model={model} relationship={relationship} record={record} />;
      } else {
        el = <Editor model={model} record={record} errors={errors} onChange={this.handleChange} />;
      }
    }

    return this.renderLayout(el, !relationship);
  }
}

export default connect(
  ({ details, settings, action }: StoreState) => ({ details, models: settings.models, action, user: settings.user }),
  (dispatch) => bindActionCreators({
    loadDetails: detailsRedux.loadDetails
  }, dispatch)
)(EditorPage);
