import * as React from 'react';
import * as tr from 'grackle';
import * as _ from 'lodash';
import { FilterViewProps, Field } from 'alaska-admin-view';
import Select from '@samoyed/select';
import CheckboxGroup from '@samoyed/checkbox-group';
import Switch from '@samoyed/switch';
import { SelectOption } from '@samoyed/types';
import { SelectFilterOptions } from '..';

type TypeView = Select | CheckboxGroup | Switch | any;

interface FilterProps extends FilterViewProps<SelectFilterOptions> {
  field: Field & { checkbox: boolean; switch: boolean };
}

export default class SelectFieldFilter extends React.Component<FilterProps> {
  tr(options: SelectOption[]): SelectOption[] {
    if (this.props.field.translate === false) {
      return options;
    }
    return _.map(options, (opt) => _.assign({}, opt, { label: tr(opt.label) }));
  }

  render() {
    let { className, field, value, onChange, options } = this.props;
    if (_.size(field.options) < 2) return null;

    let style: any = {
      maxWidth: options.maxWidth || '300px'
    };

    if (options.width) {
      style.width = options.width;
    }

    let viewClassName = 'select flex-fill';
    let View: TypeView = Select;
    let col = '3';
    if (field.checkbox) {
      View = CheckboxGroup;
    } else if (field.switch) {
      View = Switch;
    }

    if (options.checkbox) {
      View = CheckboxGroup;
    } else if (options.switch) {
      View = Switch;
    } else if (options.select) {
      View = Select;
    }

    if (View === CheckboxGroup || View === Switch) {
      col = 'auto';
      delete options.width;
    }

    if (!options.width) {
      className += ` col-${options.col || col}`;
    }

    let el = <View
      clearable={true}
      multi={false}
      className={viewClassName}
      options={this.tr(field.options)}
      value={value}
      onChange={(v: any) => onChange(v || undefined)}
    />;

    if (!options.nolabel) {
      el = <div className="input-group">
        <div className="input-group-prepend">
          <div className="input-group-text">{field.label}</div>
        </div>
        {el}
      </div>;
    }
    return (
      <div className={`${className} select-field-filter ${options.className || ''}`}>
        {el}
      </div>
    );
  }
}
