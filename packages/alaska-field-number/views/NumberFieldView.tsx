import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import * as numeral from 'numeral';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';

interface State {
  display: string;
}

export default class NumberFieldView extends React.Component<FieldViewProps, State> {
  focused: boolean;

  constructor(props: FieldViewProps) {
    super(props);
    let { value, field } = props;
    this.state = {
      display: field.format ? numeral(value).format(field.format) : value
    };
  }

  componentWillReceiveProps(nextProps: FieldViewProps) {
    let newState = {} as State;
    if (typeof nextProps.value !== 'undefined' || typeof nextProps.field.default === 'undefined') {
      if (this.focused || !nextProps.field.format) {
        //正在输入
        newState.display = nextProps.value;
      } else {
        //不在输入状态
        newState.display = numeral(nextProps.value).format(this.props.field.format);
      }
    }
    this.setState(newState);
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let display = event.target.value;
    this.setState({ display });
  };

  handleFocus = () => {
    this.focused = true;
  };

  handleBlur = () => {
    this.focused = false;
    const { field } = this.props;
    let value = this.state.display;
    let unfomarted = numeral(value).value();
    if (_.isNaN(unfomarted)) {
      unfomarted = 0;
    }
    if (field.format) {
      this.setState({ display: numeral(unfomarted).format(field.format) });
    } else {
      this.setState({ display: String(unfomarted || '') });
    }
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
      value,
      errorText,
      model
    } = this.props;
    let { help } = field;
    className += ' number-field';

    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{value}</p>;
    } else {
      let placeholder = field.placeholder ? tr(field.placeholder, model.serviceId) : '';
      inputElement = (<input
        type="text"
        className={!errorText ? 'form-control' : 'form-control is-invalid'}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={this.state.display || ''}
        disabled={disabled}
        placeholder={placeholder}
      />);
      let addonAfter = field.addonAfter ?
        <div className="input-group-append">
          <span className="input-group-text">{tr(field.addonAfter, model.serviceId)}</span>
        </div> : null;
      let addonBefore = field.addonBefore ?
        <div className="input-group-prepend">
          <span className="input-group-text">{tr(field.addonBefore, model.serviceId)}</span>
        </div> : null;
      if (addonAfter || addonBefore) {
        inputElement = <div className="input-group">{addonBefore}{inputElement}{addonAfter}</div>;
      }
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