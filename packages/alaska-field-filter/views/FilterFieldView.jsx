// @flow

import React from 'react';
import PropTypes from 'prop-types';
import FilterEditor from 'alaska-admin-view/views/FilterEditor';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import _ from 'lodash';

const CHECK_ICON = <i className="fa fa-check" />;

export default class FilterFieldView extends React.Component {

  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  props: {
    className: string,
    field: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  state: {
    ref:boolean,
    modelPath:string,
    model:any,
    selectedFields:Object
  };

  componentWillMount() {
    this.state = {
      ref: false,
      modelPath: '',
      model: null,
      selectedFields: {}
    };
    this.init(this.props);
  }

  componentWillReceiveProps(props: Object) {
    this.init(props);
  }

  init(props: Object) {
    const { field, data, value } = props;
    const { settings } = this.context;
    let state = {};
    if (field.ref[0] === ':') {
      state.ref = field.ref.substr(1);
      state.modelPath = data[state.ref];
    } else {
      state.ref = false;
      state.modelPath = field.ref;
    }

    if (state.modelPath === this.state.modelPath) return;

    if (state.modelPath) {
      state.model = settings.models[state.modelPath];
    }

    state.selectedFields = {};
    _.keys(value).forEach((key) => (state.selectedFields[key] = true));

    this.setState(state);
  }

  getFilterItems() {
    const { selectedFields, model } = this.state;
    const t = this.context.t;
    // $Flow  flow不知道该用哪种描述  lodash_v4.x.x.js:211 212
    return _.reduce(model.fields, (res, field, index) => {
      if (!field._label) {
        field._label = field.label;
        field.label = t(field.label, model.serviceId);
      }
      if (field.hidden || !field.filter) return res;
      let icon = selectedFields[field.path] ? CHECK_ICON : null;
      res.push(<MenuItem
        key={index}
        eventKey={field.path}
        className="with-icon"
      >{icon} {field.label}</MenuItem>);
      return res;
    }, []);
  }

  onFieldsChange = (fields: Object) => {
    this.setState({ selectedFields: fields });
  };

  handleFilter = (field: Object) => {
    const { selectedFields } = this.state;
    let fields = _.clone(selectedFields);
    if (fields[field]) {
      delete fields[field];
    } else {
      fields[field] = true;
    }
    this.setState({ selectedFields: fields });
  };

  render() {
    let { className, field, value, disabled, onChange, errorText } = this.props;
    const { model, selectedFields } = this.state;
    className += ' filter-field';
    if (errorText) {
      className += ' has-error';
    }

    let inputElement = [];

    if (model) {
      inputElement = [
        <FilterEditor
          key={field.path + 'FilterEditor'}
          model={model}
          value={value || {}}
          disabled={disabled}
          fields={selectedFields}
          onChange={onChange}
          onFieldsChange={this.onFieldsChange}
        />, <DropdownButton
          id={field.path + 'FilterField'}
          key={field.path + 'FilterField'}
          bsStyle="success"
          title={<i className="fa fa-plus" />}
          onSelect={this.handleFilter}
        >{this.getFilterItems()}</DropdownButton>
      ];
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? (<label className="control-label">{label}</label>) : null;
      return (
        <div className={className}>
          {labelElement}
          {inputElement}
        </div>
      );
    }
    return (
      <div className={className}>
        <label className="col-sm-2 control-label">{label}</label>
        <div className="col-sm-10">
          {inputElement}
        </div>
      </div>
    );
  }
}
