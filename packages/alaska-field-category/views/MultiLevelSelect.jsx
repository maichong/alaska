// @flow

import React from 'react';
import Select from 'alaska-field-select/views/Select';
import _ from 'lodash';

export default class MultiLevelSelect extends React.Component {

  props: {
    options: Object[],
    onChange: Function,
    value: any,
    disabled: boolean
  };

  state: {
    levels:any[],
    options: any[],
    optionsMap: Object
  };

  componentWillMount() {
    this.state = {
      levels: [],
      options: [],
      optionsMap: {}
    };
    this.init(this.props);
  }

  componentWillReceiveProps(props: Object) {
    this.init(props);
  }

  init(props: Object) {
    let options = _.cloneDeep(props.options);
    let levels = [];
    let optionsMap = {};
    if (!options || !options.length) {
      levels.push({
        options: []
      });
    } else {
      _.forEach(options, (o) => {
        optionsMap[o.value] = o;
      });

      _.forEach(options, (o) => {
        if (o.parent && optionsMap[o.parent]) {
          if (!optionsMap[o.parent].subs) {
            optionsMap[o.parent].subs = [];
          }
          optionsMap[o.parent].subs.push(o);
        } else {
          delete o.parent;
        }
      });

      options = _.filter(options, (o) => !o.parent);

      if (props.value) {
        let value = props.value;
        while (value) {
          let option = optionsMap[value];
          if (!option) {
            break;
          }
          levels.unshift({
            options: _.filter(optionsMap, (o) => o.parent === option.parent),
            value
          });
          value = option.parent;
        }
      }
      if (!levels.length) {
        levels.unshift({
          options: _.filter(optionsMap, (o) => !o.parent),
          value: props.value
        });
      } else if (props.value) {
        let option = optionsMap[props.value];
        if (option && option.subs && option.subs.length) {
          levels.push({
            options: option.subs,
            value: undefined
          });
        }
      }
    }
    this.setState({ levels, options, optionsMap });
  }

  handleChange = (level: number, value: any) => {
    if (!value) {
      let v = this.props.value;
      if (v) {
        let l = this.state.levels[level - 1];
        if (l && l.value) {
          value = l.value;
        }
      }
    } else {
      value = value.value || value;
    }
    if (value === undefined) {
      value = null;
    }
    this.props.onChange(value);
  };

  render() {
    const { disabled } = this.props;
    const { levels } = this.state;
    return (
      <div className="row multi-level-select">
        {
          _.map(levels, (level, index) => <div className="col-sm-4" key={index}>
            <Select
              disabled={disabled}
              options={level.options}
              value={level.value}
              onChange={(value) => this.handleChange(index, value)}
            />
          </div>)
        }
      </div>
    );
  }
}
