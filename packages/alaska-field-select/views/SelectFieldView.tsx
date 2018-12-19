import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import * as tr from 'grackle';
import Select from '@samoyed/select';
import Checkbox from '@samoyed/checkbox';
import Switch from '@samoyed/switch';
import { getOptionValue } from './utils';
import { SelectOption } from '@samoyed/types';
import { FieldViewProps, Field } from 'alaska-admin-view';

type TypeView = Select | Checkbox | Switch | any;

interface State {
  _field: Field & { checkbox: boolean; switch: boolean };
  options: SelectOption[];
}

interface FieldProps extends FieldViewProps {
  field: Field & { checkbox: boolean; switch: boolean };
}

function filter(record: any, options?: SelectOption[]): SelectOption[] {
  if (!options || !record || !options.length) {
    return [];
  }
  let res: SelectOption[] = [];
  _.forEach(options, (opt: SelectOption) => {
    opt.label = tr(opt.label);
    res.push(opt);
  });
  return res;
}

export default class SelectFieldView extends React.Component<FieldProps, State> {
  constructor(props: FieldProps) {
    super(props);
    this.state = {
      _field: props.field,
      options: filter(props.record, props.field.options)
    };
  }

  static getDerivedStateFromProps(nextProps: FieldProps, prevState: State) {
    let state: Partial<State> = {
      _field: nextProps.field
    };
    if (nextProps.field !== prevState._field) {
      state.options = filter(nextProps.record, nextProps.field.options);
    }
    return state;
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model') || state !== this.state;
  }

  tr(opt: SelectOption): SelectOption {
    if (this.props.field.translate === false) {
      return opt;
    }
    return Object.assign({}, opt, {
      label: tr(opt.label)
    });
  }

  render() {
    let {
      className, field, value, disabled, errorText, onChange
    } = this.props;
    let View: TypeView = Select;
    if (field.checkbox) {
      View = Checkbox;
    } else if (field.switch) {
      View = Switch;
    }
    let { help, multi } = field;
    if (multi) {
      if (!_.isArray(value)) {
        value = [value];
      }
      value = _.filter(value, (v) => typeof v !== 'undefined' && v !== null);
    }
    className += ' select-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      if (field.multi) {
        let elements: any = [];
        let valueMap: { [key: string]: any } = {};
        _.forEach(value, (v) => {
          valueMap[getOptionValue(v)] = true;
        });
        _.forEach(this.state.options, (opt) => {
          if (valueMap[String(opt.value)]) {
            elements.push(<span key={String(opt.value)}>{opt.label || opt.value}</span>);
          }
        });
        inputElement = elements;
      } else {
        let option = _.find(this.state.options, (opt) => opt.value === value);
        inputElement = option ? option.label : value;
      }
      inputElement = <p className="form-control-plaintext">{inputElement}</p>;
    } else {
      inputElement = <View
        className="Select"
        value={value}
        multi={field.multi}
        disabled={disabled}
        options={this.state.options}
        onChange={onChange}
      />;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
