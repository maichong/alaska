import * as React from 'react';
import * as _ from 'lodash';
import { FilterViewProps } from 'alaska-admin-view';
import { NumberFilterOptions } from '..';

export default class NumberFieldFilter extends React.Component<FilterViewProps<NumberFilterOptions>> {
  handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    let v = event.target.value;
    let { value, options, onChange } = this.props;
    if (options.range) {
      value = value || {};
      if (typeof value !== 'object') value = {};
      value = _.assign({}, value, { $gte: v });
    } else {
      value = v;
    }
    onChange(value);
  };

  handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    let v = event.target.value;
    let { value, onChange } = this.props;
    value = value || {};
    if (typeof value !== 'object') value = {};
    value = _.assign({}, value, { $lte: v });
    onChange(value);
  };

  render() {
    let { className, field, value, options } = this.props;
    let value1: string = value as string;
    let value2: string;

    if (value && typeof value === 'object') {
      // @ts-ignore
      value1 = value.$gte;
      // @ts-ignore
      value2 = value.$lte;
    }

    let style: any = {
      maxWidth: options.maxWidth || '200px'
    };

    if (options.width) {
      style.width = options.width;
    } else {
      let col = 2;
      if (options.range) {
        col = 3;
      }
      className += ` col-${options.col || col}`;
    }

    let el = <>
      <input
        type="text"
        className="form-control"
        onChange={this.handleChange1}
        value={value1}
      />
      {
        options.range && <input
          type="text"
          className="form-control"
          onChange={this.handleChange2}
          value={value2}
        />
      }
    </>;

    if (!options.nolabel) {
      el = <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">{field.label}</div>
        </div>
        {el}
      </div>;
    }

    return (
      <div style={style} className={`${className} number-field-filter ${options.className || ''}`}>
        {el}
      </div>
    );
  }
}
