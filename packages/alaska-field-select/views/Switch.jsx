// @flow

import React from 'react';
import _ from 'lodash';
import { getOptionValue } from './utils';

const { any, array, bool, func } = React.PropTypes;

export default class Switch extends React.Component {

  static propTypes = {
    multi: bool,
    onChange: func,
    loadOptions: func,
    value: any,
    options: array
  };

  state: {
    options:Alaska$SelectField$option[]
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      options: props.options
    };
  }

  componentWillMount() {
    let props = this.props;
    if (props.loadOptions && (!props.options || !props.options.length)) {
      this.props.loadOptions('', (error, res) => {
        if (!error && res.options) {
          this.setState({ options: res.options });
        }
      });
    }
  }

  componentWillReceiveProps(props: Object) {
    this.setState({
      options: props.options
    });
  }

  handleClick(opt: string) {
    const { value, multi, onChange } = this.props;
    const { options } = this.state;
    if (!multi) {
      return onChange(opt);
    }

    //multi
    if (!value || !value.length) {
      onChange([opt]);
      return undefined;
    }

    let optionsMap: Indexed = {};
    _.forEach(options, (o) => (optionsMap[getOptionValue(o)] = true));

    let res = [];
    let found = false;
    _.forEach(value, (v) => {
      let vid = getOptionValue(v);
      if (vid === opt) {
        found = true;
      } else if (optionsMap[vid]) {
        res.push(vid);
      }
    });
    if (!found) {
      res.push(opt);
    }
    return onChange(res);
  }

  render() {
    const { value, multi } = this.props;
    const { options } = this.state;
    let valueMap = {};
    if (multi) {
      _.forEach(value, (v) => (valueMap[getOptionValue(v)] = true));
    } else if (value !== undefined) {
      valueMap[getOptionValue(value)] = true;
    }
    return (
      <div className="btn-group">
        {_.map(options, (o) => {
          let cls = 'btn btn-' + (o.style || 'default');
          let vid = getOptionValue(o);
          if (valueMap[vid]) {
            cls += (o.style ? ' active' : ' btn-success');
          }
          return <div key={vid} className={cls} onClick={() => this.handleClick(vid)}>{o.label}</div>;
        })}
      </div>
    );
  }
}
