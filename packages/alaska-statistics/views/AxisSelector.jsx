// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'alaska-field-select/views/Select';

type Props = {
  data: Object,
  field: Object,
  value: string,
  errorText: string,
  disabled: boolean,
  onChange: Function
};

type State = {
  model: ?Object,
  options: Alaska$SelectField$option[]
};

export default class AxisSelector extends React.Component<Props, State> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: Props, context: Object) {
    super(props);
    this.state = this.initState(props, context);
  }

  componentWillReceiveProps(props: Props) {
    this.setState(this.initState(props, this.context));
  }

  initState(props: Props, context: Object) {
    let newstate: Object = {
      model: null,
      value: props.value,
      options: []
    };

    const { data, field } = props;

    if (!data || !data.model) {
      return newstate;
    }

    const { settings, t } = context;
    let model = settings.models[props.data.model];

    if (!model) {
      return newstate;
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
      options.push({ label: t(fieldItem.label), value: key });
    });

    newstate.options = options;
    return newstate;
  }

  render() {
    const {
      value, disabled, field, errorText, onChange
    } = this.props;
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
            onChange={onChange}
          />
          {helpElement}
        </div>
      </div>
    );
  }
}
