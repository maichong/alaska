import * as React from 'react';
import * as _ from 'lodash';
import { FilterViewProps } from 'alaska-admin-view';

export default class NumberFieldFilter extends React.Component<FilterViewProps> {
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
    let v1: string = value as string;
    let v2: string;
    let size = 2;
    if (options.range) {
      size = 3;
      value = value || {};
      if (typeof value !== 'object') value = {};
      // @ts-ignore
      v1 = value.$gte;
      // @ts-ignore
      v2 = value.$lte;
    }
    return (
      <div className={`${className} number-field-filter col-sm-${size}`}>
        <div className="input-group">
          <div className="input-group-prepend">
            <div className="input-group-text">{field.label}</div>
          </div>
          <input
            type="text"
            className="form-control"
            onChange={this.handleChange1}
            value={v1}
          />
          {
            options.range && <input
              type="text"
              className="form-control"
              onChange={this.handleChange2}
              value={v2}
            />
          }
        </div>
      </div>
    );
  }
}
