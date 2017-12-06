// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'seamless-immutable';
import type { ImmutableObject } from 'seamless-immutable';
import _ from 'lodash';
import akita from 'akita';
import checkDepends from 'check-depends';
import { bindActionCreators } from 'redux';
import * as detailsRedux from '../redux/details';
import * as saveRedux from '../redux/save';
import Node from './Node';
import Action from './Action';
import FieldGroup from './FieldGroup';
import Relationship from './Relationship';
import ContentHeader from './ContentHeader';
import * as settingsRedux from '../redux/settings';

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
  id: string,
  errors: {},
  service: {},
  model: Alaska$view$Model,
  record?: ImmutableObject<Alaska$view$Record>
};

type Context = {
  settings: Alaska$view$Settings,
  views: Alaska$view$Views,
  t: Function,
  router: Object,
  toast: Function,
  confirm: Function
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

  state: Object;
  _r: number;
  loading: boolean;

  context: Context;

  constructor(props: Props, context: Context) {
    super(props);

    this._r = Math.random();

    this.state = {
      serviceId: props.match.params.service,
      modelName: props.match.params.model,
      id: props.match.params.id,
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
    let newState = {};
    if (nextProps.match.params) {
      newState.serviceId = nextProps.match.params.service;
      newState.modelName = nextProps.match.params.model;
      newState.id = decodeURIComponent(nextProps.match.params.id);
      if (newState.id === '_new' && this.state.id && this.state.id !== '_new') {
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
    }
    let { save } = nextProps;
    if (save._r === this._r && !save.fetching) {
      this._r = Math.random();
      this.loading = false;
      if (save.error) {
        //保存失败
        // $Flow save.error一定存在
        toast('error', t('Save failed'), save.error.message);
      } else {
        toast('success', t('Saved successfully'));
        const { state } = this;
        if (state.id === '_new') {
          let url = '/edit/' + state.serviceId + '/' + state.modelName + '/' + encodeURIComponent(save.res._id);
          this.context.router.history.replace(url);
        }
      }
    }
    this.setState(newState, () => {
      this.init();
    });
  }

  init() {
    const { details } = this.props;
    let { id, model, record } = this.state;
    if (!model) return;
    if (id === '_new') {
      if (!record) {
        record = {};
      }
      let newData = { _id: '' };
      _.forEach(model.fields, (field) => {
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
      this.setState({
        record: details[key][id]
      });
    } else {
      this.refresh();
    }
  }

  refresh() {
    const {
      id, serviceId, modelName, model
    } = this.state;
    this.props.loadDetails({
      service: serviceId,
      model: modelName,
      key: model.key,
      id
    });
  }

  handleChange(key: any, value: any) {
    this.setState({
      record: this.state.record.set(key, value)
    });
  }

  handleCreate = () => {
    let url = '/edit/' + this.state.serviceId + '/' + this.state.modelName + '/_new';
    this.context.router.history.replace(url);
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
      id
    } = this.state;
    let { fields } = model;
    let errors = {};
    let hasError = false;
    const { t } = this.context;
    _.forEach(fields, (field, key) => {
      if (field.required && !record[key]) {
        if (field.required === true || checkDepends(field.required, record)) {
          errors[key] = t('This field is required!');
          hasError = true;
        }
      }
    });
    this.setState({ errors });
    if (hasError) return;
    this._r = Math.random();
    this.loading = true;

    this.props.saveAction({
      service: model.serviceId,
      model: model.modelName,
      key: model.key,
      _r: this._r
    }, record.set('id', id.toString() === '_new' ? undefined : id));
  };

  async handleAction(action: string) {
    const { model, record, id } = this.state;
    const { t, toast, confirm } = this.context;

    const config = model.actions[action];
    if (config && config.confirm) {
      await confirm(t('Confirm'), t(config.confirm, model.serviceId));
    }

    try {
      if (config.pre && config.pre.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        if (!eval(config.pre.substr(3))) {
          return;
        }
      }

      if (config.script && config.script.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.script.substr(3));
      } else {
        let body = Object.assign({}, record, { id: id.toString() === '_new' ? '' : id });
        await akita.post('/api/action', {
          params: {
            _service: model.serviceId,
            _model: model.modelName,
            _action: action
          },
          body
        });
      }
      toast('success', t('Successfully'));
      if (config.post === 'refresh') {
        this.props.refreshSettings();
      } else {
        this.refresh();
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        // eslint-disable-next-line
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  }

  handleBack = () => {
    this.context.router.history.goBack();
  };

  render() {
    let {
      id,
      model,
      record,
      errors,
      serviceId
    } = this.state;
    const { views, t, settings } = this.context;
    if (!record) {
      return <div className="loading">Loading...</div>;
    }
    if (record._error) {
      return <div className="editor-error">{record._error}</div>;
    }
    //console.log('model.abilities', model.abilities);
    const isNew = id === '_new';
    let canSave = (isNew && model.abilities.create) || (!isNew && model.abilities.update && !model.noupdate);
    // eslint-disable-next-line
    let title = <a onClick={this.handleBack}>{t(model.label || model.modelName, serviceId)}</a>;
    let subTitle = '';
    if (isNew) {
      subTitle = t('Create');
    } else if (model.titleField) {
      subTitle = t(record[model.titleField], serviceId);
    } else {
      subTitle = id;
    }
    title = <div>{title} &gt; {subTitle}</div>;

    let map = _.reduce(model.fields, (res: Object, f: Alaska$Field$options, path: string) => {
      res[path] = {
        path,
        after: f.after,
        afters: []
      };
      return res;
    }, {});

    let fieldPaths = [];

    _.forEach(map, (f) => {
      if (f.after && map[f.after]) {
        map[f.after].afters.push(f);
      } else {
        fieldPaths.push(f);
      }
    });

    let paths = [];

    function flat(f) {
      paths.push(f.path);
      f.afters.forEach(flat);
    }

    _.forEach(fieldPaths, flat);

    let groups = {
      default: {
        title: '',
        fields: []
      }
    };

    for (let groupKey of Object.keys(model.groups)) {
      let group = _.clone(model.groups[groupKey]);
      group.title = t(group.title, serviceId);
      group.fields = [];
      groups[groupKey] = group;
    }

    for (let path of paths) {
      let cfg = model.fields[path];
      if (cfg.hidden) continue;
      if (cfg.super && !settings.superMode) continue;
      if (!cfg.view) continue;
      if (cfg.depends && !checkDepends(cfg.depends, record)) continue;
      let ViewClass = views[cfg.view];
      if (!ViewClass) {
        console.warn('Missing : ' + cfg.view);
        ViewClass = views.TextFieldView;
      }

      let disabled = false;
      if (model.noupdate || this.loading || !canSave) {
        disabled = true;
      } else if (cfg.disabled) {
        if (cfg.disabled === true) {
          disabled = true;
        } else {
          disabled = checkDepends(cfg.disabled, record);
        }
      }

      let label = t(cfg.label, serviceId);
      let help = t(cfg.help, serviceId);

      let fieldProps = {
        key: path,
        value: record[path],
        model,
        record,
        field: _.assign({}, cfg, { label, help }),
        disabled,
        errorText: errors[path],
        onChange: this.handleChange.bind(this, path), // eslint-disable-line react/jsx-no-bind
        className: 'form-group ' + model.id + '-' + path + '-view'
      };

      // $Flow
      let view = React.createElement(ViewClass, fieldProps);
      let group = groups.default;
      if (cfg.group && groups[cfg.group]) {
        group = groups[cfg.group];
      }
      group.fields.push(view);
    }
    let groupElements = [];
    for (let groupKey of Object.keys(groups)) {
      let group = groups[groupKey];
      if (!group.fields.length) {
        continue;
      }
      if (group.super && !settings.superMode) continue;
      let className = model.id + '-group-' + groupKey + ' field-group-panel panel panel-' + (group.style || 'default');
      let groupEl = <FieldGroup key={groupKey} className={className} {...group}>{group.fields}</FieldGroup>;
      groupElements.push(groupEl);
    }

    let actionElements = [];
    let removeDialogElement = null;

    // 创建时，显示保存按钮
    if (
      isNew
      && model.abilities.create
      && !model.nocreate
      && !(model.actions.create && model.actions.create.depends && !checkDepends(model.actions.create.depends, record))
    ) {
      actionElements.push(<Action
        key="create"
        action={_.assign({
          key: 'create',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, model.actions.create)}
        model={model}
        disabled={this.loading}
        onClick={this.handleSave}
      />);
    } else if (
      !isNew
      && model.abilities.update
      && !model.noupdate
      && !(model.actions.update && model.actions.update.depends && !checkDepends(model.actions.update.depends, record))
    ) {
      actionElements.push(<Action
        key="update"
        action={_.assign({
          key: 'update',
          icon: 'save',
          style: 'primary',
          tooltip: 'Save'
        }, model.actions.update)}
        model={model}
        disabled={this.loading}
        onClick={this.handleSave}
      />);
    }

    if (
      !isNew
      && !model.noremove
      && model.abilities.remove
      && model.actions.remove !== false
      && !(model.actions.remove && model.actions.remove.depends && !checkDepends(model.actions.remove.depends, record))
    ) {
      actionElements.push(<Action
        key="remove"
        action={_.assign({
          key: 'remove',
          icon: 'close',
          style: 'danger',
          tooltip: 'Remove'
        }, model.actions.remove)}
        model={model}
        disabled={this.loading}
        onClick={this.handleRemove}
      />);
    }

    if (
      !isNew
      && !model.nocreate
      && model.abilities.create
      && model.actions.create !== false
      && model.actions.add !== false
    ) {
      // 创建另一个
      actionElements.push(<Action
        key="add"
        action={_.assign({
          key: 'create',
          icon: 'plus',
          style: 'success',
          tooltip: 'Create record'
        }, model.actions.create, model.actions.add)}
        model={model}
        disabled={this.loading}
        onClick={this.handleCreate}
      />);
    }

    //扩展动作按钮
    _.forEach(model.actions, (action, key) => {
      if (['add', 'create', 'update', 'remove'].indexOf(key) > -1) return;
      if (action.super && !settings.superMode) return;
      if (action.depends && !checkDepends(action.depends, record)) return;
      if (action.list && !action.editor) return;
      let disabled = this.loading;
      if (!disabled && action.disabled) {
        disabled = checkDepends(action.disabled, record);
      }
      actionElements.push(<Action
        onClick={() => this.handleAction(key)}
        key={key}
        disabled={disabled}
        model={model}
        action={action}
        record={record}
        id={id}
      />);
    });

    let relationships = null;
    if (!isNew && model.relationships) {
      relationships = _.map(
        model.relationships,
        (r: Object, key: string) => {
          if (r.super && !settings.superMode) return null;
          return (<Relationship
            key={key}
            from={id}
            path={r.path}
            service={r.service}
            model={model}
            filters={r.filters}
            title={r.title}
          />);
        }
      );
    }

    return (
      <Node id="editor" props={this.props} state={this.state} className={serviceId + '-' + model.id}>
        <ContentHeader>
          {title}
        </ContentHeader>
        {isNew ? null : <div>ID : {id}</div>}
        {groupElements}
        {removeDialogElement}
        {relationships}
        <nav className="navbar navbar-fixed-bottom bottom-bar">
          <div className="container-fluid">
            <div className="navbar-form navbar-right">
              {actionElements}
            </div>
          </div>
        </nav>
      </Node>
    );
  }
}

export default connect(({ details, save }) => ({ details, save }), (dispatch) => bindActionCreators({
  loadDetails: detailsRedux.loadDetails,
  saveAction: saveRedux.save,
  refreshSettings: settingsRedux.refreshSettings
}, dispatch))(EditorPage);
