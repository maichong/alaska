// @flow

import React from 'react';
import _ from 'lodash';
import { api } from 'alaska-admin-view';
import shallowEqualWithout from 'shallow-equal-without';
import MultiLevelSelect from './MultiLevelSelect';

type State = {
  options: any[]
};

export default class CategoryFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      options: []
    };
  }

  componentWillMount() {
    this.init();
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  init() {
    let { field, value } = this.props;
    // $Flow 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (!ref) return;
    let [refServiceId, refModelName] = ref.split('.');

    api.post('/api/relation', {
      params: {
        _service: refServiceId,
        _model: refModelName,
        ...(field.filters || {})
      },
      body: { value }
    }).then((res) => {
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
    let {
      className, field, value, disabled, errorText
    } = this.props;
    let { help } = field;
    className += ' category-field';
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
      inputElement = _.map(value, (v, index) => (<MultiLevelSelect
        key={index}
        value={v || ''}
        disabled={disabled}
        onChange={(va) => this.handleChange(index, va)}
        options={this.state.options}
      />));
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
