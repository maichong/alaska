import * as React from 'react';
import * as DateTime from 'react-datetime';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FilterViewProps } from 'alaska-admin-view';
import { DatetimeFilterOptions } from '..';

export default class DatetimeFieldFilter extends React.Component<FilterViewProps<DatetimeFilterOptions>> {
  handleChange1 = (date: moment.Moment) => {
    let v = date.toISOString();
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

  handleChange2 = (date: moment.Moment) => {
    let v = date.toISOString();
    let { value, onChange } = this.props;
    value = value || {};
    if (typeof value !== 'object') value = {};
    value = _.assign({}, value, { $lte: v });
    onChange(value);
  };

  render() {
    let { className, field, value, options } = this.props;
    let value1: string = value as string;
    let value2 = '';

    if (value && typeof value === 'object') {
      // @ts-ignore
      value1 = value.$gte;
      // @ts-ignore
      value2 = value.$lte;
    }

    let format = options.format;
    if (!format) {
      format = 'YYYY-MM-DD';
      if (options.month) {
        format = 'YYYY-MM';
      } else if (options.year) {
        format = 'YYYY';
      }
    }

    let el = <>
      <DateTime
        className="flex-1"
        value={value1 && moment(value1).format(format)}
        dateFormat={format}
        timeFormat={false}
        onChange={this.handleChange1}
      />
      {
        options.range && <DateTime
          className="flex-1"
          value={value2 && moment(value2).format(format)}
          dateFormat={format}
          timeFormat={false}
          onChange={this.handleChange2}
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

    let style: any = {
      maxWidth: options.maxWidth || '300px'
    };

    if (options.width) {
      style.width = options.width;
    } else {
      let col = 3;
      if (options.range) {
        col = 4;
      }
      className += ` col-${options.col || col}`;
    }
    return (
      <div style={style} className={`${className} datetime-field-filter ${options.className || ''}`}>
        {el}
      </div>
    );
  }
}
