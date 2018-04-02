// @flow

/* eslint eqeqeq:0 */
/* eslint no-unused-vars:1 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactSelect from 'react-select';

type Props = Alaska$SelectField$Props;

type State = {
  options: Alaska$SelectField$option[],
  optionsMap: {
    [value: string]: Alaska$SelectField$option,
  },
  value?: Alaska$SelectField$value
};

function processOptions(
  options?: Alaska$SelectField$option[],
  optionsMap: {
    [value: string]: Alaska$SelectField$option,
  },
  value: Alaska$SelectField$value
): Alaska$SelectField$option[] {
  let valueMap = {};
  if (Array.isArray(value)) {
    _.forEach(value, (v) => {
      valueMap[String(v)] = true;
    });
  } else {
    valueMap[String(value)] = true;
  }
  let res = _.map(options || [], (opt) => {
    if (typeof opt.style === 'string') {
      opt = _.omit(opt, 'style');
    }
    let vKey = String(opt.value);
    optionsMap[vKey] = opt;
    if (valueMap[vKey]) {
      delete valueMap[vKey];
    }
    return opt;
  });
  if (_.size(valueMap)) {
    _.keys(valueMap).forEach((v) => {
      if (optionsMap[v]) {
        res.push(optionsMap[v]);
      }
    });
  }
  return res;
}

export default class Select extends React.Component<Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  _cache: Object;

  constructor(props: Props) {
    super(props);
    let optionsMap = {};
    let options = processOptions(props.options, optionsMap, props.value);
    this.state = {
      options,
      optionsMap
    };
    this.state.value = this.processValue(props.value);
    this._cache = {};
  }

  componentWillMount() {
    let props = this.props;
    if (props.loadOptions && (!props.options || !props.options.length)) {
      this.handleSearchChange('');
    }
  }

  componentWillReceiveProps(props: Props) {
    let state = {};
    if (props.options !== this.props.options || props.value !== this.props.value) {
      state.optionsMap = this.state.optionsMap;
      let options = props.options;
      if (props.multi && props.loadOptions) {
        options = this.state.options;
      }
      state.options = processOptions(options, state.optionsMap, props.value);
      state.value = this.processValue(props.value);
    }
    this.setState(state);
  }

  componentWillUnmount() {
    this._cache = {};
  }

  processValue = (value: any) => {
    let optionsMap = this.state.optionsMap;

    function processOne(v): string | number | boolean {
      if (v && typeof v === 'object') {
        if (v.value !== undefined) {
          return v.value;
        }
        return v;
      }
      if (optionsMap[String(v)]) {
        return optionsMap[String(v)].value;
      }
      return v;
    }

    if (this.props.multi) {
      if (!value || !value.length) {
        return [];
      }
      return _.map(value, processOne);
    }
    return processOne(value);
  };

  handleChange = (value: Alaska$SelectField$option | Alaska$SelectField$option[]) => {
    let { optionsMap } = this.state;
    let newValue = '';
    if (value) {
      if (Array.isArray(value)) {
        let arr = [];
        value.forEach((vv: Alaska$SelectField$option) => {
          if (vv.label != String(vv.value)) {
            optionsMap[String(vv.value)] = vv;
          }
          arr.push(vv.value);
        });
        newValue = arr;
      } else {
        optionsMap[String(value.value)] = value;
        newValue = value.value;
      }
    }
    // $Flow
    this.setState({ optionsMap, value: newValue });
    if (this.props.onChange) {
      this.props.onChange(newValue);
    }
  };

  handleSearchChange = (search: string) => {
    const { value } = this.props;
    let { optionsMap } = this.state;
    let cacheKey = 'c_' + (search || JSON.stringify(value));
    if (this._cache[cacheKey]) {
      this.setState({
        options: processOptions(this._cache[cacheKey], optionsMap, value),
        optionsMap
      });
      return;
    }
    // $Flow 我们知道此处 loadOptions 一定存在
    this.props.loadOptions(search, (error, res) => {
      if (!error && res.options) {
        this._cache[cacheKey] = res.options;
        this.setState({
          options: processOptions(this._cache[cacheKey], optionsMap, value),
          optionsMap
        });
      }
    });
  };

  render() {
    const { t } = this.context;
    let {
      onChange,
      value,
      options,
      multi,
      allowCreate,
      loadOptions,
      disabled,
      ...others
    } = this.props;

    let View = ReactSelect;
    if (allowCreate) {
      View = ReactSelect.Creatable;
    } else if (allowCreate) {
      View = ReactSelect;
    }

    return (
      <View
        multi={multi}
        onChange={this.handleChange}
        value={this.state.value}
        onInputChange={loadOptions ? this.handleSearchChange : undefined}
        // $Flow
        options={this.state.options}
        disabled={disabled}
        placeholder={t('Select...')}
        {...others}
      />
    );
  }
}
