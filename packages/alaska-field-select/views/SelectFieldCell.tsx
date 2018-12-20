import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import { CellViewProps } from 'alaska-admin-view';
import { getOptionValue } from './utils';

export default class SelectFieldCell extends React.Component<CellViewProps> {
  shouldComponentUpdate(props: CellViewProps) {
    return props.value !== this.props.value;
  }
  render() {
    let { field, value, model } = this.props;
    let el: string | any[];
    let cls = 'select-field-cell';

    if (field.multi) {
      let arr: any[] = [];
      let valueMap: { [path: string]: boolean } = {};
      _.forEach(value, (v) => {
        valueMap[getOptionValue(v)] = true;
      });
      _.forEach(field.options, (opt) => {
        if (valueMap[String(opt.value)]) {
          let label = tr(opt.label || String(opt.value), model.serviceId);
          if (arr.length) {
            arr.push(' , ');
          }
          let c;
          if (opt.color) {
            c = `text-${opt.color}`;
          }
          arr.push(<span className={c} key={String(opt.value)}>{label}</span>);
        }
      });
      el = arr;
    } else {
      let option = _.find(field.options, (opt) => opt.value === value);
      el = tr(option ? option.label : value, model.serviceId);
      if (option && option.color) {
        cls += ` text-${option.color}`;
      }
    }
    return <div className={cls}>{el}</div>;
  }
}
