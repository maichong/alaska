// @flow

import React from 'react';
import _ from 'lodash';
import { getOptionValue } from './utils';

type Props = Alaska$SelectField$Props;

type State = {
  options?: Alaska$SelectField$option[]
};

export default class Switch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      options: props.options
    };
  }

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(props: Props) {
    this.init(props);
  }

  init(props: Alaska$SelectField$Props) {
    if (props.loadOptions && (!props.options || !props.options.length)) {
      props.loadOptions('', (error, res) => {
        if (!error && res.options) {
          this.setState({ options: res.options });
        }
      });
    } else {
      this.setState({ options: props.options });
    }
  }

  handleClick(opt: string) {
    const { value, multi, onChange } = this.props;
    const { options } = this.state;

    let optionsMap: Indexed<Alaska$SelectField$option> = {};
    _.forEach(options, (o) => {
      optionsMap[getOptionValue(o)] = o;
    });

    if (!multi) {
      if (optionsMap[opt]) {
        onChange(optionsMap[opt].value);
      } else {
        onChange(opt);
      }
      return;
    }

    //multi
    if (!value || !value.length) {
      if (optionsMap[opt] !== undefined && optionsMap[opt].value !== undefined) {
        onChange([optionsMap[opt].value]);
      } else {
        onChange([opt]);
      }
      return;
    }

    let valueArray: Array<string | number | boolean> = [];

    if (Array.isArray(value)) {
      valueArray = value;
    } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      valueArray = [value];
    }

    let res = [];
    let found = false;
    _.forEach(valueArray, (v: string | number | boolean) => {
      let vid = String(v);
      if (vid === opt) {
        found = true;
      } else if (optionsMap[vid] !== undefined) {
        if (optionsMap[vid].value !== undefined) {
          res.push(optionsMap[vid].value);
        } else {
          res.push(vid);
        }
      }
    });
    if (!found) {
      res.push(opt);
    }
    onChange(res);
  }

  render() {
    const { value, multi, disabled } = this.props;
    const { options } = this.state;
    let valueMap = {};
    if (multi) {
      if (Array.isArray(value)) {
        _.forEach(value, (v) => {
          valueMap[getOptionValue(v)] = true;
        });
      }
    } else if (value !== undefined) {
      valueMap[getOptionValue(value)] = true;
    }
    return (
      <div className="btn-group">
        {_.map(options, (o) => {
          let cls = 'btn';
          let vid = getOptionValue(o);
          if (valueMap[vid]) {
            cls += (o.style ? ' active btn-' + o.style : ' active btn-success');
          } else {
            cls += ' btn-default';
          }
          if (disabled) {
            cls += ' disabled';
          }
          return <div key={vid} className={cls} onClick={disabled ? null : () => this.handleClick(vid)}>{o.label}</div>;
        })}
      </div>
    );
  }
}
