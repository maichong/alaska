// @flow

/* eslint eqeqeq:0 */
/* eslint no-unused-vars:1 */

import React from 'react';
import _ from 'lodash';
import { SimpleSelect, MultiSelect } from 'react-selectize';

function createFromSearchSimple(options, search) {
  if (!search) {
    return null;
  }
  search = search.trim();
  return search ? { label: search, value: search } : null;
}

function createFromSearchMulti(options, values, search) {
  if (!search) {
    return null;
  }
  search = search.trim();
  let labels = values.map((v) => v.label);
  if (!search || labels.indexOf(search) > -1) {
    return null;
  }
  return { label: search, value: search };
}

export default class Select extends React.Component {

  props: {
    multi: boolean,
    onChange: Function,
    loadOptions: Function,
    value: any,
    options: Object[]
  };

  state: {
    options: Alaska$SelectField$option[];
    optionsMap: {
      [value:string]:Alaska$SelectField$option;
    };
    value:Alaska$SelectField$option | Alaska$SelectField$option[];
  };

  _cache: Object;

  constructor(props: Object) {
    super(props);
    this.state = {
      options: props.options,
      optionsMap: {},
    };
    if (props.options) {
      for (let o of props.options) {
        this.state.optionsMap[o.value] = o;
      }
    }
    this.state.value = this.processValue(props.value);
    this._cache = {};
  }

  componentWillMount() {
    let props = this.props;
    if (props.loadOptions && (!props.options || !props.options.length)) {
      this.handleSearchChange('');
    }
  }

  componentWillReceiveProps(props: Object) {
    let state = {};
    if (props.options !== this.props.options) {
      state.options = props.options;
      state.optionsMap = {};
      if (props.options) {
        for (let o of props.options) {
          state.optionsMap[o.value] = o;
        }
      }
    }
    if (props.value !== undefined) {
      state.value = this.processValue(props.value);
    }
    this.setState(state, () => {
      if (state.optionsMap) {
        this.setState({ value: this.processValue(props.value) });
      }
    });
  }

  componentWillUnmount() {
    this._cache = {};
  }

  processValue = (value: any) => {
    let optionsMap = this.state.optionsMap;

    function processOne(v): Alaska$SelectField$option {
      if (v && typeof v === 'object') {
        if (v.label !== v.value) {
          return v;
        }
        if (optionsMap[v.value]) {
          return optionsMap[v.value];
        }
        return v;
      }
      if (optionsMap[v]) {
        return optionsMap[v];
      }
      return { label: v, value: v };
    }

    if (this.props.multi) {
      if (!value || !value.length) {
        return [];
      }
      return _.map(value, processOne);
    }
    return processOne(value);
  };

  handleChange = (value: Alaska$SelectField$option|Alaska$SelectField$option[]) => {
    let optionsMap = this.state.optionsMap;
    if (value) {
      if (value instanceof Array) {
        value.forEach((vv) => {
          if (vv.label != String(vv.value)) {
            optionsMap[String(vv.value)] = vv;
          }
        });
      } else if (value.label != String(value.value)) {
        optionsMap[String(value.value)] = value;
      }
    }
    this.setState({ optionsMap, value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  renderValueWithRemove = (item: Alaska$SelectField$option) => {
    let me = this;

    function handleRemove() {
      let values = [];
      let value = me.state.value;
      if (value instanceof Array) {
        value.forEach((v) => {
          if (v.value != item.value) {
            values.push(v);
          }
        });
      }
      me.setState({ value: values });
      if (me.props.onChange) {
        me.props.onChange(values);
      }
    }

    return (
      <div className="simple-value">
        <span
          className="simple-value-remove"
          onClick={handleRemove}
        >x</span>
        <span>{item.label}</span>
      </div>
    );
  };

  handleSearchChange = (search: string) => {
    if (this._cache[search]) {
      this.setState({ options: this._cache[search] });
      return;
    }
    this.props.loadOptions(search, (error, res) => {
      if (!error && res.options) {
        let options = this._cache[search] = res.options;
        let optionsMap = this.state.optionsMap;
        options.forEach((o) => {
          optionsMap[o.value] = o;
        });
        let value = this.state.value;
        console.log('value', value);
        if (value instanceof Array) {
          if (this.props.multi) {
            value.forEach((v) => {
              let vStr = String(v.value);
              if (v.label == vStr && optionsMap[vStr]) {
                v.label = optionsMap[vStr].label;
              }
            });
          }
        } else if (value && value.label == String(value.value) && optionsMap[String(value.value)]) {
          value.label = optionsMap[String(value.value)].label;
        }
        this.setState({ options, value, optionsMap });
      }
    });
  };

  render() {
    let {
      onChange,
      value,
      options,
      multi,
      allowCreate,
      renderValue,
      loadOptions,
      disabled,
      ...others
    } = this.props;

    if (multi) {
      return (
        <MultiSelect
          createFromSearch={allowCreate ? createFromSearchMulti : null}
          renderValue={renderValue || disabled ? renderValue : this.renderValueWithRemove}
          onValuesChange={this.handleChange}
          values={this.state.value}
          onSearchChange={loadOptions ? this.handleSearchChange : null}
          options={this.state.options}
          disabled={disabled}
          {...others}
        />
      );
    }

    return (
      <SimpleSelect
        createFromSearch={allowCreate ? createFromSearchSimple : null}
        renderValue={renderValue}
        onValueChange={this.handleChange}
        value={this.state.value}
        onSearchChange={loadOptions ? this.handleSearchChange : null}
        options={this.state.options}
        disabled={disabled}
        {...others}
      />
    );
  }
}
