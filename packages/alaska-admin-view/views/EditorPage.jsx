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
import FieldGroup from './FieldGroup';
import Relationship from './Relationship';
import TopToolbar from './TopToolbar';
import EditorActions from './EditorActions';
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
  isNew: boolean,
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

  handleFieldChange = (key: any, value: any) => {
    this.setState({ record: this.state.record.set(key, value) });
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
    } else if (model.titleField) {
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
    return (
      <nav className="navbar navbar-fixed-bottom bottom-toolbar">
        <div className="container-fluid">
          <EditorActions
            model={model}
            record={record}
            id={id}
            isNew={isNew}
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
          model={model}
          filters={r.filters}
          title={r.title}
        />)
      );
    }
    return relationships;
  }

  renderGroups() {
    const {
      model, record, id, isNew, errors
    } = this.state;
    let map = _.reduce(model.fields, (res: Object, f: Alaska$Field$options, path: string) => {
      res[path] = {
        path,
        after: f.after,
        afters: []
      };
      return res;
    }, {});

    let fieldPathsList = [];

    _.forEach(map, (f) => {
      if (f.after && map[f.after]) {
        map[f.after].afters.push(f);
      } else {
        fieldPathsList.push(f);
      }
    });

    let paths = [];

    function flat(f) {
      paths.push(f.path);
      f.afters.forEach(flat);
    }

    _.forEach(fieldPathsList, flat);

    let groups = {
      default: {
        title: '',
        fields: []
      }
    };

    for (let groupKey of Object.keys(model.groups)) {
      let group = _.clone(model.groups[groupKey]);
      group.fields = [];
      groups[groupKey] = group;
    }

    for (let path of paths) {
      let field = model.fields[path];
      let group = groups.default;
      if (field.group && groups[field.group]) {
        group = groups[field.group];
      }
      group.fields.push(field);
    }

    const groupElements = [];
    for (let groupKey of Object.keys(groups)) {
      let group = groups[groupKey];
      if (!group.fields.length) {
        continue;
      }
      const { fields, ...others } = group;
      groupElements.push((
        <FieldGroup
          key={groupKey}
          path={groupKey}
          model={model}
          fields={fields}
          id={id}
          isNew={isNew}
          record={record}
          errors={errors}
          loading={this.loading}
          onFieldChange={this.handleFieldChange}
          {...others}
        />
      ));
    }
    return groupElements;
  }

  render() {
    let {
      isNew,
      id,
      model,
      record,
      serviceId
    } = this.state;
    if (!record) {
      return <div className="loading">Loading...</div>;
    }
    if (record._error) {
      return <div className="editor-error">{record._error}</div>;
    }
    return (
      <Node id="editor" props={this.props} state={this.state} className={serviceId + '-' + model.id}>
        {this.renderToolbar()}
        {isNew ? null : <div className="top-toolbar-id visible-xs-block">ID : {id}</div>}
        {this.renderGroups()}
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
