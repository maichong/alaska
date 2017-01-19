// @flow

import React from 'react';
import Select from 'alaska-field-select/lib/Select';
import _forEach from 'lodash/forEach';

const { bool, string, func, object } = React.PropTypes;

export default class AxisSelector extends React.Component {

  static propTypes = {
    data: object,
    field: object,
    value: string,
    errorText: string,
    disabled: bool,
    onChange: func
  };

  static contextTypes = {
    settings: object,
    t: func
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

  handleChange = (option: Object) => {
    this.props.onChange(option && option.value ? option.value : option);
  };

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
      return this.setState(newstate);
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

    _forEach(model.fields, (field, key) => {
      if (key === '_id') return;
      if (plains.indexOf(field.plain) === -1) return;
      if (!field._label) {
        field._label = field.label;
        field.label = t(field.label);
      }
      options.push({ label: field.label, value: key });
    });

    newstate.options = options;
    this.setState(newstate);
  }

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
