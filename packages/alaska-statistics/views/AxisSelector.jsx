// @flow

import React from 'react';
import _ from 'lodash';
import Select from 'alaska-field-select/views/Select';

const { func, object } = React.PropTypes;

export default class AxisSelector extends React.Component {

  static contextTypes = {
    settings: object,
    t: func
  };

  props: {
    data: Object,
    field: Object,
    value: string,
    errorText: string,
    disabled: boolean,
    onChange: Function
  };

  state: {
    model:?Object;
    options:Object;
  };

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(props: Object) {
    this.init(props);
  }

  init(props: Object) {
    let newstate: Object = {
      model: null,
      value: props.value
    };

    const { data, field } = props;

    if (!data || !data.model) {
      this.setState(newstate);
      return;
    }

    const { settings, t } = this.context;
    let model = settings.models[props.data.model];

    if (!model) {
      this.setState(newstate);
      return;
    }

    newstate.model = model;

    let options = [];

    let plains = [];

    if (field.path === 'x') {
      if (data.type === 'time' || data.type === 'cycle') {
        plains.push('date');
      }
      if (data.type === 'enum') {
        plains.push('string', 'number', 'bool', 'id');
      }
    }

    if (field.path === 'y') {
      plains.push('number');
    }

    _.forEach(model.fields, (fieldItem, key) => {
      if (key === '_id') return;
      if (plains.indexOf(fieldItem.plain) === -1) return;
      if (!fieldItem._label) {
        fieldItem._label = fieldItem.label;
        fieldItem.label = t(fieldItem.label);
      }
      options.push({ label: fieldItem.label, value: key });
    });

    newstate.options = options;
    this.setState(newstate);
  }

  handleChange = (option: Object) => {
    this.props.onChange(option && option.value ? option.value : option);
  };

  render() {
    const { value, disabled, field, errorText } = this.props;
    const { model, options } = this.state;
    if (!model) return null;
    let className = 'form-group axis-selector-field';
    let helpElement = null;
    if (errorText) {
      className += ' has-error';
      helpElement = <p className="help-block">{errorText}</p>;
    }

    return (
      <div className={className}>
        <label className="col-sm-2 control-label">{field.label}</label>
        <div className="col-sm-10">
          <Select
            value={value}
            disabled={disabled}
            options={options}
            onChange={this.handleChange}
          />
          {helpElement}
        </div>
      </div>
    );
  }
}
