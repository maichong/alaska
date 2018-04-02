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
  if (Array.isArray(opt)) return '';
  if (opt && typeof opt === 'object') return opt.value;
  return opt;
}

type State = {
  options?: Alaska$SelectField$option[]
};

export default class RelationshipFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  state = {
    options: undefined
  };

  componentWillReceiveProps(props: Alaska$view$Field$View$Props) {
    // 只有 fixed 字段需要在此组件中加载options
    if (props.value !== this.props.value && props.field.fixed) {
      if (_.find(this.state.options, (o) => o.value === props.value)) return;
      this.setState({ options: [] }, this.handleSearch);
    }
    if (!props.field.fixed && this.state.options) {
      this.setState({ options: undefined });
    }
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    if (props.record !== this.props.record && props.field.fixed) {
      if (
        _.find(
          props.field.filters,
          (v) => (_.isString(v) && v[0] === ':' && props.record[v.substr(1)] !== this.props.record[v.substr(1)])
        )
      ) {
        setTimeout(this.handleSearch);
        return true;
      }
    }
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'search')
      || this.state.options !== state.options;
  }

  handleChange = (value: Alaska$SelectField$value) => {
    if (this.props.onChange) {
      let val = null;
      if (this.props.field.multi) {
        let arr = [];
        if (Array.isArray(value)) _.forEach(value, (o) => arr.push(getOptionValue(o)));
        val = arr;
      } else if (value) {
        val = getOptionValue(value);
      }
      //this.setState({ value });
      this.props.onChange(val);
    }
  };

  handleSearch = (keyword?: string, callback?: Function) => {
    keyword = keyword || '';
    const { field, record, value } = this.props;
    // $Flow 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (!ref) return;
    let filters = _.reduce(field.filters || {}, (res: {}, v: any, key: string) => {
      res[key] = v;
      if (_.isString(v) && v[0] === ':') {
        res[key] = record[v.substr(1)];
      }
      return res;
    }, {});

    const [serviceId, modelName] = ref.split('.');

    api.post('/api/relation', {
      params: {
        _service: serviceId,
        _model: modelName,
        _search: keyword,
        ...filters
      },
      body: { value }
    }).then((res) => {
      if (callback) {
        callback(null, {
          options: res.results
        });
      } else {
        let options = immutable(res.results);
        this.setState({ options });
      }
    }, (error) => {
      if (callback) {
        callback(error);
      }
    });
  };

  render() {
    let {
      className, field, value, disabled, errorText
    } = this.props;
    const { options } = this.state;
    let { help } = field;
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
    let refServiceId = '';
    let refModelName = '';
    // $Flow 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (ref) {
      [refServiceId, refModelName] = ref.split('.');
    }

    let inputElement;
    if (field.fixed) {
      let opts = [];
      if (options) {
        if (typeof value === 'string') {
          value = [value];
        }
        _.forEach(value, (v) => {
          let opt: ?Alaska$SelectField$option = _.find(options, (o) => o.value === v);
          opts.push(opt || { value: v, label: v });
        });
      } else {
        this.handleSearch();
      }

      inputElement = <p className="form-control-static">{
        opts.map((opt: Alaska$SelectField$option) => (<a
          key={String(opt.value)}
          href={`#/edit/${refServiceId}/${refModelName}/${String(opt.value)}`}
          style={{ paddingRight: 10 }}
        >{opt.label}
        </a>))
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

    if (field.horizontal) {
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
    return (
      <div className={className}>
        {label ? <label className="control-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
