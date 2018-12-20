import * as _ from 'lodash';
import * as React from 'react';
import { FilterViewProps, Field } from 'alaska-admin-view';
import { Filter, FilterValue, FilterObject } from 'alaska-model';
import * as tr from 'grackle';
import Select from '@samoyed/select';
import Checkbox from '@samoyed/checkbox';
import Switch from '@samoyed/switch';
import { SelectValue, SelectOption } from '@samoyed/types';

type TypeView = Select | Checkbox | Switch | any;

interface FilterState {
  value: any;
  inverse: boolean;
  error: boolean;
}

interface FilterProps extends FilterViewProps {
  field: Field & { checkbox: boolean; switch: boolean };
}

// 1 等于
enum Modes { 'eq' = 1, 'ne' }

export default class SelectFieldFilter extends React.Component<FilterProps, FilterState> {
  constructor(props: FilterProps) {
    super(props);
    let propsValue: Filter = props.value || {};
    let mode: Modes = Modes.eq;
    let value: FilterValue = '';
    let inverse: boolean = false;
    if (propsValue && typeof propsValue === 'object') {
      let condition: FilterObject = propsValue as FilterObject;
      if (condition.$eq) {
        value = condition.$eq.toString();
      } else if (condition.$ne) {
        value = condition.$ne.toString();
        inverse = true;
      }
    }
    let error = false;
    if (!value) {
      error = true;
    }
    this.state = {
      value: value,
      inverse,
      error: error
    };
  }

  tr(opt: SelectOption): SelectOption {
    if (this.props.field.translate === false || !tr) {
      return opt;
    }
    return Object.assign({}, opt, {
      label: tr(opt.label)
    });
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleChange = (value: SelectValue) => {
    this.setState({ value }, () => this.handleBlur());
  };

  handleBlur = () => {
    let { value, inverse } = this.state;
    if (typeof value === 'undefined') {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let tag = '$eq';
    if (inverse) {
      tag = '$ne';
    }
    this.props.onChange({ [tag]: value });
  };

  render() {
    let { className, field, onClose } = this.props;
    const { value, inverse, error } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = `${buttonClassName} btn-success`;
    className += ` select-field-filter align-items-center${error ? ' error' : ''}`;
    let viewClassName = 'Select';
    let View: TypeView = Select;
    if (field.checkbox) {
      viewClassName = 'Checkbox';
      View = Checkbox;
    } else if (field.switch) {
      viewClassName = 'Switch';
      View = Switch;
    }
    return (
      <div className={className}>
        <label className="col-2 col-form-label text-right">{field.label}</label>
        <div className="form-inline col-10">
          <div className="form-group" style={{ minWidth: 230 }}>
            <View
              clearable={true}
              placeholder="请选择过滤条件"
              multi={false}
              className={viewClassName}
              options={field.options}
              value={value}
              onChange={this.handleChange}
            />
          </div>
          <a
            className={inverse ? buttonClassNameActive : buttonClassName}
            onClick={this.handleInverse}
          >{tr('inverse')}
          </a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
