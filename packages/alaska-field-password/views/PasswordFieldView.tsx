import * as React from 'react';
import * as tr from 'grackle';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';

interface State {
  _record: any;
  value1: string;
  value2: string;
  errorText: string;
}

export default class PasswordFieldView extends React.Component<FieldViewProps, State> {
  handleChange1: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange2: (event: React.ChangeEvent<HTMLInputElement>) => void;

  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      _record: props.record,
      value1: '',
      value2: '',
      errorText: ''
    };
    this.handleChange1 = this.handleChange.bind(this, 1);
    this.handleChange2 = this.handleChange.bind(this, 2);
  }

  static getDerivedStateFromProps(nextProps: FieldViewProps, prevState: State) {
    let state: Partial<State> = {
      _record: nextProps.record
    };
    if (nextProps.record && nextProps.record && nextProps.record._id !== prevState._record._id) {
      state.value1 = '';
      state.value2 = '';
    }
    return state;
  }

  shouldComponentUpdate(nextProps: FieldViewProps, state: State) {
    if (!nextProps.record || !this.props.record) {
      return false;
    }
    return nextProps.disabled !== this.props.disabled
      || nextProps.record._id !== this.props.record._id
      || nextProps.value !== this.props.value
      || !this.state.value1
      || !this.state.value2
      || this.state.value1 !== this.state.value2
      || !shallowEqualWithout(state, this.state, '_record');
  }

  getError(): string {
    const { value1, value2 } = this.state;
    if (value1 !== value2) {
      return tr('The passwords are not match');
    }
    return '';
  }

  handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    let state = {} as State;
    // @ts-ignore index 值一定是 1 或者 2 为state属性中的一个
    state[(`value${index}`)] = e.target.value as string;
    this.setState(state);
  }

  handleBlur = () => {
    let { value1, value2 } = this.state;
    let newState = {
      errorText: ''
    };
    if (value1 && value1 !== value2) {
      newState.errorText = value2 ? 'The passwords are not match' : 'Please enter the new password again';
    }
    if (value1 && value1 === value2) {
      if (this.props.onChange) {
        this.props.onChange(value1);
      }
    }

    this.setState(newState);
  };

  render() {
    let { className, field, disabled } = this.props;
    const { state, props } = this;
    className += ' password-field';
    let inputClassName = 'form-control';

    let { help } = field;
    let errorText = state.errorText || props.errorText;
    if (errorText) {
      className += ' is-invalid';
      help = tr(errorText);
      inputClassName += ' is-invalid';
    }

    let helpElement = help ? <small className={errorText ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;

    let inputElement;

    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">******</p>;
    } else {
      inputElement = (
        <div className="row">
          <div className="col-sm-4">
            <input
              className={inputClassName}
              type="password"
              value={state.value1}
              placeholder={tr('Enter new password')}
              disabled={disabled}
              onBlur={this.handleBlur}
              onChange={this.handleChange1}
            />
            {helpElement}
          </div>
          <div className="col-sm-4">
            <input
              className={inputClassName}
              type="password"
              value={state.value2}
              placeholder={tr('Repeat password')}
              disabled={disabled}
              onBlur={this.handleBlur}
              onChange={this.handleChange2}
            />
          </div>
        </div>
      );
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? (<label className="col-form-label">{label}</label>) : null}
        {inputElement}
      </div>
    );
  }
}
