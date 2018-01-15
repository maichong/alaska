// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'seamless-immutable';
import type { ImmutableObject } from 'seamless-immutable';
import _ from 'lodash';
import akita from 'akita';
import { bindActionCreators } from 'redux';
import * as detailsRedux from '../redux/details';
import * as saveRedux from '../redux/save';
import Node from './Node';
import Editor from './Editor';
import Relationship from './Relationship';
import TopToolbar from './TopToolbar';
import EditorActions from './EditorActions';
import * as settingsRedux from '../redux/settings';
import parseAbility from '../utils/parse-ability';

type Props = {
  loadDetails: Function,
  refreshSettings: Function,
  saveAction: Function,
  details: Alaska$view$details,
  save: Alaska$view$save,
  match: Alaska$view$match<{
    service: string,
    model: string,
    id: string
  }>
};

type State = {
  serviceId: string,
  modelName: string,
  isNew: boolean,
  id: string,
  errors: {},
  service: {},
  model: Object,
  record?: ImmutableObject<Alaska$view$Record>
};

class EditorPage extends React.Component<Props, State> {
  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    router: PropTypes.object,
    toast: PropTypes.func,
    confirm: PropTypes.func,
  };

  context: {
    settings: Alaska$view$Settings,
    views: Alaska$view$Views,
    t: Function,
    router: Object,
    toast: Function,
    confirm: Function
  };

  _r: number;
  loading: boolean;
  editorRef: Editor;

  constructor(props: Props, context: Context) {
    super(props);

    this._r = Math.random();

    let { service: serviceId, model: modelName, id } = props.match.params;
    id = decodeURIComponent(id);
    this.state = {
      serviceId,
      modelName,
      id,
      isNew: id === '_new',
      errors: {},
      service: {},
      model: {}
    };

    let service = context.settings.services[this.state.serviceId];
    if (!service) return;
    this.state.service = service;
    let model = service.models[this.state.modelName];
    if (!model) return;
    this.state.model = model;
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { toast, t } = this.context;
    let { save } = nextProps;
    if (save._r === this._r) {
      if (!save.fetching) {
        this._r = Math.random();
        this.loading = false;
        if (save.error) {
          //保存失败
          // $Flow save.error一定存在
          toast('error', t('Save failed'), save.error.message);
        } else if (save.res) {
          toast('success', t('Saved successfully'));
          const { state } = this;
          if (state.id === '_new') {
            let url = '/edit/' + state.serviceId + '/' + state.modelName + '/' + encodeURIComponent(save.res._id);
            this.context.router.history.replace(url);
          }
        }
      }
      return;
    }

    let { service: serviceId, model: modelName, id } = nextProps.match.params;
    let newState: Indexed<any> = {
      serviceId,
      modelName,
      id: decodeURIComponent(id),
      isNew: id === '_new'
    };
    if (newState.isNew && this.state.id && !this.state.isNew) {
      //新建时候清空表单
      newState.record = Immutable({ _id: '' });
    }

    let service = this.context.settings.services[newState.serviceId];
    if (service) {
      newState.service = service;
      let model = service.models[newState.modelName];
      if (model) {
        newState.model = model;
      }
    }
    this.setState(newState, () => {
      this.init();
    });
  }

  init() {
    const { details } = this.props;
    let {
      id, isNew, model, record
    } = this.state;
    if (!model) return;
    if (isNew) {
      if (!record) {
        record = {};
      }
      let newData = { _id: '' };
      _.forEach(model.fields, (field) => {
        // $Flow record
        if (record[field.path] !== undefined) {
          newData[field.path] = record[field.path];
        } else if (field.default !== undefined) {
          newData[field.path] = field.default;
        }
      });
      this.setState({ record: Immutable(newData) });
      return;
    }
    let { key } = model;
    if (details[key] && details[key][id]) {
      this.setState({ record: details[key][id] });
    } else {
      this.refresh();
    }
  }

  refresh = () => {
    const {
      id, serviceId, modelName, model
    } = this.state;
    this.props.loadDetails({
      service: serviceId,
      model: modelName,
      key: model.key,
      id
    });
  };

  canCreate = (): boolean => {
    const { model, record } = this.state;
    const { settings } = this.context;
    if (!model || model.nocreate) return false;
    let ability = _.get(model, 'actions.create.ability');
    if (ability) {
      ability = parseAbility(ability, record);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.create) return false;
    return true;
  };

  canUpdate = (): boolean => {
    const { model, record } = this.state;
    const { settings } = this.context;
    if (!model || model.noupdate) return false;
    let ability = _.get(model, 'actions.update.ability');
    if (ability) {
      ability = parseAbility(ability, record);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.update) return false;
    return true;
  };

  canRemove = (): boolean => {
    const { model, record } = this.state;
    const { settings } = this.context;
    if (!model || model.noremove) return false;
    let ability = _.get(model, 'actions.remove.ability');
    if (ability) {
      ability = parseAbility(ability, record);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.remove) return false;
    return true;
  };

  handleRemove = async() => {
    const { serviceId, modelName, id } = this.state;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove record'), t('confirm remove record'), [{
      title: t('Remove'),
      style: 'danger'
    }]);
    this.loading = true;
    try {
      await akita.post('/api/remove', {
        params: {
          _service: serviceId,
          _model: modelName
        },
        body: { id }
      });
      toast('success', t('Successfully'));
      this.loading = false;

      let url = '/list/' + serviceId + '/' + modelName;
      this.context.router.history.replace(url);
    } catch (error) {
      //console.error(error.stack);
      toast('error', t('Failed'), error.message);
    }
  };

  handleSave = () => {
    let {
      record,
      model,
      id,
      isNew
    } = this.state;
    if (!record) return;
    let { fields } = model;
    let errors = {};
    let hasError = false;
    const { t } = this.context;
    _.forEach(fields, (field, key) => {
      // $Flow record 一定存在
      if (field.required && !record[key]) {
        if (field.required) {
          errors[key] = t('This field is required!');
          hasError = true;
        }
      }
    });

    this.setState({ errors });
    // TODO 页面滚动到第一个错误Field
    if (hasError || _.find(this.editorRef.fieldRefs, (f) => (f.hasError && f.hasError()))) return;
    this._r = Math.random();
    this.loading = true;

    let _id = record._id || undefined;
    if (!isNew && id !== '') {
      _id = id;
    } else {
      id = '';
    }

    this.props.saveAction({
      service: model.serviceId,
      model: model.modelName,
      key: model.key,
      _r: this._r
    }, record.merge({
      id,
      _id
    }));
  };

  handleBack = () => {
    this.context.router.history.goBack();
  };

  renderToolbar() {
    const {
      isNew, id, model, record, serviceId
    } = this.state;
    const { t } = this.context;
    let title = <a onClick={this.handleBack} className="pointer">{t(model.label || model.modelName, serviceId)}</a>;
    let subTitle = '';
    if (isNew) {
      subTitle = t('Create');
    } else if (model.titleField && record) {
      subTitle = t(record[model.titleField], serviceId);
    } else {
      subTitle = id;
    }
    title = <div>{title} &gt; {subTitle}</div>;
    return (
      <TopToolbar actions={isNew ? null : <div className="top-toolbar-id hidden-xs">ID : {id}</div>}>
        {title}
      </TopToolbar>
    );
  }

  renderBottomBar() {
    const {
      id, model, isNew, record
    } = this.state;
    if (!record) return null;
    return (
      <nav className="navbar navbar-fixed-bottom bottom-toolbar">
        <div className="container-fluid">
          <EditorActions
            model={model}
            record={record}
            id={id}
            isNew={isNew}
            refresh={this.refresh}
            refreshSettings={this.props.refreshSettings}
            onSave={this.handleSave}
            onRemove={this.handleRemove}
            loading={this.loading}
          />
        </div>
      </nav>
    );
  }

  renderRelationships() {
    const { isNew, id, model } = this.state;
    let relationships = null;
    if (!isNew && model.relationships) {
      relationships = _.map(
        model.relationships,
        (r: Object, key: string) => (<Relationship
          key={key}
          from={id}
          path={r.path}
          service={r.service}
          model={r.model}
          filters={r.filters}
          title={r.title}
        />)
      );
    }
    return relationships;
  }

  render() {
    let {
      id,
      model,
      record,
      serviceId,
      errors
    } = this.state;
    if (!record) {
      return <div className="loading">Loading...</div>;
    }
    if (record._error) {
      return <div className="editor-error">{record._error}</div>;
    }
    let className = 'editor-page ' + serviceId + '-' + model.id;
    if (this.canCreate()) {
      className += ' can-create';
    } else {
      className += ' no-create';
    }
    if (this.canUpdate()) {
      className += ' can-update';
    } else {
      className += ' no-update';
    }
    if (this.canRemove()) {
      className += ' can-remove';
    } else {
      className += ' no-remove';
    }

    return (
      <Node id="editorPage" props={this.props} state={this.state} className={className}>
        {this.renderToolbar()}
        <Editor
          model={model}
          id={id}
          ref={(r) => {
            // $Flow
            this.editorRef = r;
          }}
          record={record}
          errors={errors}
          onChange={(r) => this.setState({ record: r })}
        />
        {this.renderRelationships()}
        {this.renderBottomBar()}
      </Node>
    );
  }
}

export default connect(({ details, save }) => ({ details, save }), (dispatch) => bindActionCreators({
  loadDetails: detailsRedux.loadDetails,
  saveAction: saveRedux.save,
  refreshSettings: settingsRedux.refreshSettings
}, dispatch))(EditorPage);
