// @flow

import React from 'react';
import _ from 'lodash';
import { api } from 'alaska-admin-view';
import shallowEqualWithout from 'shallow-equal-without';
import MultiLevelSelect from './MultiLevelSelect';

export default class CategoryFieldView extends React.Component {

  props: {
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  state: {
    options: any[],
    value: any|null
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      options: [],
      value: null
    };
  }

  componentWillMount() {
    this.init();
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  init() {
    let field = this.props.field;
    api('/api/relation')
      .param('service', field.service)
      .param('model', field.model)
      .param('value', field.value)
      .where(field.filters || {})
      // $Flow
      .then((res) => {
        this.setState({ options: res.results });
      });
  }

  handleChange = (index: number, value: any) => {
    const { field, onChange } = this.props;
    if (!field.multi) {
      onChange(value);
    } else {
      let values = _.clone(this.props.value);
      if (!Array.isArray(values)) {
        values = [values];
      }
      values[index] = value;
      onChange(values);
    }
  };

  handleAdd = () => {
    const { onChange } = this.props;
    let values = _.clone(this.props.value);
    if (!Array.isArray(values)) {
      values = [values];
    } else {
      values.push(null);
    }
    onChange(values);
  };

  render() {
    let { field, value, disabled, errorText } = this.props;
    let help = field.help;
    let className = 'form-group category-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;

    if (field.multi) {
      className += ' category-field-multi';
      if (!Array.isArray(value)) {
        value = [value];
      }
      if (!value.length) {
        value.push(null);
      }
      // $Flow
      inputElement = _.map(value, (v, index) => <MultiLevelSelect
        key={index}
        value={v || ''}
        disabled={disabled}
        onChange={(va) => this.handleChange(index, va)}
        options={this.state.options}
      />);
      if (!disabled) {
        inputElement.push(<div className="btn btn-success" key="add" onClick={this.handleAdd}>
          <i className="fa fa-plus" />
        </div>);
      }
    } else {
      inputElement = (
        <MultiLevelSelect
          value={value || ''}
          disabled={disabled}
          onChange={(v) => this.handleChange(0, v)}
          options={this.state.options}
        />
      );
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? <label className="control-label">{label}</label> : null;
      return (
        <div className={className}>
          {labelElement}
          {inputElement}
          {helpElement}
        </div>
      );
    }
    return (
      <div className={className}>
        <label className="col-sm-2 control-label">{label}</label>
        <div className="col-sm-10">
          {inputElement}
          {helpElement}
        </div>
      </div>
    );
  }
}
