// @flow

import React from 'react';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';
import Select from 'alaska-field-select/views/Select';
import Switch from 'alaska-field-select/views/Switch';
import SelectCheckbox from 'alaska-field-select/views/SelectCheckbox';
import { api } from 'alaska-admin-view';
import immutable from 'seamless-immutable';

function getOptionValue(opt) {
  if (opt && typeof opt === 'object') return opt.value;
  return opt;
}

export default class RelationshipFieldView extends React.Component {

  props: {
    className: string,
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  state: {
    value?: string | number | Array<any>;
    options: Alaska$SelectField$option[] | null
  };

  cache: Object;

  constructor(props: Object) {
    super(props);
    this.cache = {};
    this.state = {
      options: null
    };
  }

  componentWillReceiveProps(props: Object) {
    if (props.value !== this.props.value) {
      if (_.find(this.state.options, (o) => o.value === props.value)) return;
      this.setState({ options: [] }, this.handleSearch);
    }
  }

  shouldComponentUpdate(props: Object, state: Object) {
    if (props.data !== this.props.data) {
      let filters = props.field.filters;
      if (
        _.find(
          filters,
          (v) => (_.isString(v) && v[0] === ':' && props.data[v.substr(1)] !== this.props.data[v.substr(1)])
        )
      ) {
        setTimeout(this.handleSearch);
        return true;
      }
    }
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  componentWillUnmount() {
    this.cache = {};
  }

  handleChange = (value: string|number) => {
    if (this.props.onChange) {
      let val = null;
      if (this.props.field.multi) {
        let arr = [];
        if (Array.isArray(value)) _.forEach(value, (o) => arr.push(getOptionValue(o)));
        val = arr;
      } else if (value) {
        val = getOptionValue(value);
      }
      this.setState({ value });
      this.props.onChange(val);
    }
  };

  handleSearch = (keyword?: string) => {
    keyword = keyword || '';
    const { field, data } = this.props;
    let filters = _.reduce(field.filters || {}, (res: {}, value: any, key: string) => {
      res[key] = value;
      if (_.isString(value) && value[0] === ':') {
        res[key] = data[value.substr(1)];
      }
      return res;
    }, {});

    let cacheKey = JSON.stringify(filters) + keyword;
    if (this.cache[cacheKey]) {
      if (this.cache[cacheKey] === this.state.options) return;
      setTimeout(() => {
        this.setState({ options: this.cache[cacheKey] });
      });
      return;
    }

    api('/api/relation')
      .param('service', field.service)
      .param('model', field.model)
      .param('value', field.value)
      .search(keyword)
      .where(filters)
      .then((res) => {
        let options = immutable(res.results);
        this.cache[cacheKey] = options;
        this.setState({ options });
      });
  };

  render() {
    let { className, field, value, disabled, errorText } = this.props;
    const options = this.state.options;
    let help = field.help;
    let View = Select;
    if (field.checkbox) {
      View = SelectCheckbox;
    } else if (field.switch) {
      View = Switch;
    }
    className += ' relationship-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let inputElement;
    if (field.fixed) {
      let opts = [];
      if (!options) {
        this.handleSearch();
      } else {
        if (typeof value === 'string') {
          value = [value];
        }
        _.forEach(value, (v) => {
          let opt: Alaska$SelectField$option = _.find(options, (o) => o.value === v);
          opts.push(opt || { value: v, label: v });
        });
      }

      inputElement = <p className="form-control-static">
        {
          opts.map(
            (opt: Alaska$SelectField$option) => <a
              key={opt.value}
              href={`#/edit/${field.service}/${field.model}/${String(opt.value)}`}
              style={{ paddingRight: 10 }}
            >{opt.label}</a>
          )
        }
      </p>;
    } else {
      inputElement = (
        <View
          multi={field.multi}
          value={value || ''}
          disabled={disabled}
          onChange={this.handleChange}
          options={options}
          loadOptions={this.handleSearch}
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
