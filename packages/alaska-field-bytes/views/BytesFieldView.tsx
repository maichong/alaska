import * as React from 'react';
import * as numeral from 'numeral';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import { Filter } from 'alaska-model';
import { FilterViewProps } from 'alaska-admin-view';

interface State {
  display?: Filter;
}

export default class BytesFieldView extends React.Component<FilterViewProps, State> {
  focused: boolean;

  constructor(props: FilterViewProps) {
    super(props);
    this.state = {
      display: numeral(props.value).format('0,0')
    };
  }

  componentWillReceiveProps(nextProps: FilterViewProps) {
    let newState = {} as State;
    if (nextProps.value) {
      if (this.focused) {
        //正在输入
        newState.display = nextProps.value;
      } else {
        //不在输入状态
        newState.display = numeral(nextProps.value).format('0,0');
      }
    }
    this.setState(newState);
  }

  shouldComponentUpdate(props: FilterViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let display = event.target.value;
    this.setState({ display });
  };

  handleFocus = () => {
    this.focused = true;
    this.forceUpdate();
  };

  handleBlur = () => {
    this.focused = false;
    let value = this.state.display;
    let unfomarted = numeral(value).value();
    if (_.isNaN(unfomarted)) {
      unfomarted = 0;
    }
    this.setState({ display: numeral(unfomarted).format('0,0') }, () => this.forceUpdate());
    if (unfomarted !== this.props.value) {
      if (this.props.onChange) {
        this.props.onChange(unfomarted);
      }
    }
  };

  render() {
    let {
      className,
      field,
      disabled,
      errorText,
    } = this.props;
    let {
      help, unit, size, precision
    } = field;
    className += ' bytes-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let value: number = numeral(this.state.display).value() || 0;
    let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
    let num = value;
    while (num > (size || 0) && units.length > 1) {
      num /= (size || 0);
      units.shift();
    }
    let u = this.focused ? unit : (units[0] + (unit || ''));
    let display = this.focused ? value : _.round(num, precision);
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{display}</p>;
    } else {
      inputElement = (<div className="input-group"><input
        type="text"
        className={!errorText ? 'form-control' : 'form-control is-invalid'}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={display}
        disabled={disabled}
      />
      <div className="input-group-append">
        <span className="input-group-text">{u}</span>
      </div>
      </div>);
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
        {label ? (<label className="col-form-label">{label}</label>) : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
