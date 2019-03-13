import * as React from 'react';
import Select from '@samoyed/select';
import * as _ from 'lodash';

type Props = {
  options: Object[];
  onChange: Function;
  value: any;
  disabled?: boolean;
};

type State = {
  levels: any[];
  options: any[];
  optionsMap: Object;
};

export default class MultiLevelSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // @ts-ignore
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps: Props) {
    let options = _.cloneDeep(nextProps.options);
    let levels = [];
    let optionsMap: any = {};
    if (!options || !options.length) {
      levels.push({
        options: []
      });
    } else {
      _.forEach(options, (o: any) => {
        optionsMap[o.value] = o;
      });
      _.forEach(options, (o: any) => {
        if (o.parent && optionsMap[o.parent]) {
          if (!optionsMap[o.parent].subs) {
            optionsMap[o.parent].subs = [];
          }
          optionsMap[o.parent].subs.push(o);
        } else {
          delete o.parent;
        }
      });
      options = _.filter(options, (o: any) => !o.parent);

      if (nextProps.value) {
        let value = nextProps.value;
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
          value: nextProps.value
        });
      } else if (nextProps.value) {
        let option = optionsMap[nextProps.value];
        if (option && option.subs && option.subs.length) {
          levels.push({
            options: option.subs
          });
        }
      }
    }
    return { levels, options, optionsMap };
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
    if (typeof value === 'undefined') {
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
          _.map(levels, (level, index) => (<div className="col-sm-4" key={index}>
            <Select
              disabled={disabled}
              options={level.options}
              value={level.value}
              onChange={(value) => this.handleChange(index, value)}
            />
          </div>))
        }
      </div>
    );
  }
}
