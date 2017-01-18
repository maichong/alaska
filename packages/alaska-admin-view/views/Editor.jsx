/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-03
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _map from 'lodash/map';

import Node from './Node';
import Action from './Action';
import FieldGroup from './FieldGroup';
import Relationship from './Relationship';
import ContentHeader from './ContentHeader';
import { PREFIX } from '../constants';
import api from '../utils/api';
import checkDepends from '../utils/check-depends';

const { object, func } = React.PropTypes;

class Editor extends React.Component {

  static propTypes = {
    details: object,
    save: object,
    params: object
  };

  static contextTypes = {
    actions: object,
    views: object,
    settings: object,
    t: func,
    router: object,
    toast: func,
    confirm: func,
  };

  constructor(props, context) {
    super(props);

    this._r = Math.random();

    this.state = {
      serviceId: props.params.service,
      modelName: props.params.model,
      id: props.params.id,
      errors: {}
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

  componentWillReceiveProps(nextProps) {
    const toast = this.context.toast;
    let newState = {};
    if (nextProps.params) {
      newState.serviceId = nextProps.params.service;
      newState.modelName = nextProps.params.model;
      newState.id = nextProps.params.id;
      if (newState.id === '_new' && this.state.id && this.state.id !== '_new') {
        //新建时候清空表单
        newState.data = {};
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
    if (nextProps.save && nextProps.save._r == this._r) {
      this._r = Math.random();
      let t = this.context.t;
      this.loading = false;
      if (nextProps.save.error) {
        //保存失败
        toast('error', t('Save failed'), nextProps.save.error.message);
      } else {
        toast('success', t('Saved successfully'));
        if (this.state.id === '_new') {
          let url = '/edit/' + this.state.serviceId + '/' + this.state.modelName + '/' + nextProps.save.res._id;
          this.context.router.replace(url);
        }
      }
    }
    this.setState(newState, () => {
      this.init();
    });
  }

  init() {
    const state = this.state;
    if (!state.model) return;
    let id = state.id;
    if (id === '_new') {
      let data = state.data || {};
      let newData = {};
      _forEach(state.model.fields, field => {
        if (data[field.path] !== undefined) {
          newData[field.path] = data[field.path];
        } else if (field.default !== undefined) {
          newData[field.path] = field.default;
        }
      });
      this.setState({ data: newData });
      return;
    }
    let key = state.model.key;
    if (this.props.details[key] && this.props.details[key][id]) {
      this.setState({
        data: this.props.details[key][id]
      });
    } else {
      this.refresh();
    }
  }

  refresh() {
    const state = this.state;
    const id = state.id;
    this.context.actions.details({
      service: state.serviceId,
      model: state.modelName,
      key: state.model.key,
      id
    });
  }

  handleChange(key, value) {
    this.setState({
      data: Object.assign({}, this.state.data, {
        [key]: value
      })
    });
  }

  handleCreate = () => {
    let url = '/edit/' + this.state.serviceId + '/' + this.state.modelName + '/_new';
    this.context.router.replace(url);
  };

  handleRemove = async () => {
    const { serviceId, modelName, id } = this.state;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove record'), t('confirm remove record'), [{
      title: t('Remove'),
      style: 'danger'
    }]);
    this.loading = true;
    try {
      await api.post(PREFIX + '/api/remove?' + qs.stringify({
          service: serviceId,
          model: modelName
        }), { id });
      toast('success', t('Successfully'));
      this.loading = false;

      let url = '/list/' + serviceId + '/' + modelName;
      this.context.router.replace(url);
    } catch (error) {
      //console.error(error.stack);
      toast('error', t('Failed'), error.message);
    }
  };

  handleSave = () => {
    let {
      data,
      model,
      id
      } = this.state;
    let fields = model.fields;
    let errors = {};
    let hasError = false;
    const t = this.context.t;
    for (let key in fields) {
      let field = fields[key];

      if (field.required && !data[key]) {
        if (field.required === true || checkDepends(field.required, data)) {
          errors[key] = t('This field is required!');
          hasError = true;
        }
      }
    }
    this.setState({ errors });
    if (hasError) return;
    this._r = Math.random();
    this.loading = true;

    this.context.actions.save({
      service: model.service.id,
      model: model.name,
      key: model.key,
      _r: this._r,
      data: Object.assign({}, data, { id: id == '_new' ? '' : id })
    });
  };

  async handleAction(action) {
    const { model, data, id } = this.state;
    const { t, toast, confirm, actions } = this.context;

    const config = model.actions[action];
    if (config && config.confirm) {
      await confirm(t('Confirm'), t(config.confirm, model.service.id));
    }

    try {
      if (config.pre && config.pre.substr(0, 3) === 'js:') {
        if (!eval(config.pre.substr(3))) {
          return;
        }
      }

      if (config.script && config.script.substr(0, 3) === 'js:') {
        eval(config.script.substr(3));
      } else {
        let body = Object.assign({}, data, { id: id == '_new' ? '' : id });
        await api.post(PREFIX + '/api/action?' + qs.stringify({
            service: model.service.id,
            model: model.name,
            action
          }), body);
      }
      toast('success', t('Successfully'));
      if (config.post === 'refresh') {
        actions.refresh();
      } else {
        this.refresh();
      }
      if (config.post && config.post.substr(0, 3) === 'js:') {
        eval(config.post.substr(3));
      }
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  }

  handleBack = () => {
    this.context.router.goBack();
  };

  render() {
    let {
      id,
      model,
      data,
      errors,
      serviceId,
      modelName
      } = this.state;
    const { views, t, settings } = this.context;
    if (!data) {
      return <div className="loading">Loading...</div>;
    }
    let canSave = (id === '_new' && model.abilities.create) || (id !== '_new' && model.abilities.update && !model.noedit);
    let title = <a onClick={this.handleBack}>{t(model.label || model.name, serviceId)}</a>;
    let subTitle = '';
    if (id == '_new') {
      subTitle = t('Create');
    } else if (model.title) {
      subTitle = t(data[model.title], serviceId);
    } else {
      subTitle = id;
    }
    title = <div>{title} > {subTitle}</div>;
    let groups = {
      default: {
        title: '',
        fields: []
      }
    };

    for (let groupKey in model.groups) {
      let group = model.groups[groupKey];
      if (typeof group == 'string') {
        group = { title: group };
      }
      if (!group._title) {
        group._title = group.title;
        group.title = t(group.title, serviceId);
      }
      group.fields = [];
      groups[groupKey] = group;
    }
    for (let key in model.fields) {
      let cfg = model.fields[key];
      if (cfg.hidden) continue;
      if (cfg.super && !settings.superMode) continue;
      if (!cfg.view) continue;
      if (cfg.depends && !checkDepends(cfg.depends, data)) continue;
      let ViewClass = views[cfg.view];
      if (!ViewClass) {
        console.warn('Missing : ' + cfg.view);
        ViewClass = views.TextFieldView;
      }

      let disabled = false;
      if (model.noedit || this.loading || !canSave) {
        disabled = true;
      } else if (cfg.disabled) {
        if (cfg.disabled === true) {
          disabled = true;
        } else {
          disabled = checkDepends(cfg.disabled, data);
        }
      }

      if (!cfg._label) {
        cfg._label = cfg.label;
        cfg.label = t(cfg.label, serviceId);
      }
      if (cfg.help && !cfg._help) {
        cfg._help = cfg.help;
        cfg.help = t(cfg.help, serviceId);
      }

      let fieldProps = {
        key,
        value: data[key],
        model,
        data,
        field: cfg,
        disabled,
        errorText: errors[key],
        onChange: this.handleChange.bind(this, key)
      };

      let view = React.createElement(ViewClass, fieldProps);
      let group = groups.default;
      if (cfg.group && groups[cfg.group]) {
        group = groups[cfg.group];
      }
      group.fields.push(view);
    }
    let groupElements = [];
    for (let groupKey in groups) {
      let group = groups[groupKey];
      if (!group.fields.length) {
        continue;
      }
      if (group.super && !settings.superMode) continue;
      let groupEl = <FieldGroup key={groupKey} {...group}>{group.fields}</FieldGroup>;
      groupElements.push(groupEl);
    }

    let actionElements = [];
    let removeDialogElement = null;

    if (canSave && model.actions.save && model.actions.save.depends && !checkDepends(model.actions.save.depends, data)) {
      canSave = false;
    }

    if (canSave && model.actions.save !== false) {
      actionElements.push(<button
        className="btn btn-primary"
        onClick={this.handleSave}
        key="save"
        disabled={this.loading}
      ><i className="fa fa-save"/></button>);
    }
    let canRemove = true;
    if (model.actions.remove && model.actions.remove.depends && !checkDepends(model.actions.remove.depends, data)) {
      canRemove = false;
    }
    if (canRemove && !model.noremove && id !== '_new' && model.abilities.remove && model.actions.remove !== false) {
      actionElements.push(<button
        className="btn btn-danger"
        onClick={this.handleRemove}
        key="remove"
        disabled={this.loading}
      ><i className="fa fa-close"/></button>);
    }

    let canCreate = true;
    if (model.actions.create && model.actions.create.depends && !checkDepends(model.actions.create.depends, data)) {
      canCreate = false;
    }
    if (canCreate && !model.nocreate && id !== '_new' && model.abilities.create) {
      actionElements.push(<button
        onClick={this.handleCreate}
        className="btn btn-success"
        key="create"
        disabled={this.loading}
      ><i className="fa fa-plus"/></button>);
    }

    //扩展动作按钮
    _forEach(model.actions, (action, key)=> {
      if (['create', 'save', 'remove'].indexOf(key) > -1) return;
      if (action.super && !settings.superMode) return;
      if (action.depends && !checkDepends(action.depends, data)) return;
      if (action.list && !action.editor) return;
      let disabled = this.loading;
      if (!disabled && action.disabled) {
        disabled = checkDepends(action.disabled, data);
      }
      actionElements.push(<Action
        onClick={() => this.handleAction(key)}
        key={key}
        disabled={disabled}
        model={model}
        action={action}
        data={data}
        id={id}
      />);
    });

    let relationships = null;
    if (id != '_new' && model.relationships) {
      relationships = _map(model.relationships,
        (r, index) => {
          if (r.super && !settings.superMode) return;
          return <Relationship
            key={index}
            from={id}
            path={r.path}
            service={r.service}
            model={r.model}
            filters={r.filters}
            title={r.title}
          />
        });
    }

    return (
      <Node id="editor" props={this.props} state={this.state}>
        <ContentHeader>
          {title}
        </ContentHeader>
        {
          id === '_new' ? null : <div >ID : {id}</div>
        }
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

export default connect(({ details, save }) => ({ details, save }))(Editor);
