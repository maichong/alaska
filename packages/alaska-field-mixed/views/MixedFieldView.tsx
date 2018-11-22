import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';

interface State {
  text: string;
  style?: string;
}

export default class MixedFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      text: JSON.stringify(props.value, null, 4)
    };
  }

  componentWillReceiveProps(props: FieldViewProps) {
    if (typeof props.value !== 'undefined') {
      this.setState({
        text: JSON.stringify(props.value, null, 4)
      });
    }
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    let { value } = e.target;
    let state = {
      text: value
    } as State;
    try {
      JSON.parse(value);
    } catch (error) {
      try {
        // eslint-disable-next-line
        eval('json=' + value);
      } catch (err) {
        state.style = 'has-error';
      }
    }
    this.setState(state);
  };

  handleBlur = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    let { value } = e.target;
    let json;
    let state = {
      text: value
    } as State;
    try {
      json = JSON.parse(value);
    } catch (error) {
      try {
        // eslint-disable-next-line
        json = eval('json=' + value);
      } catch (err) {
        state.style = 'has-error';
      }
    }
    this.setState(state);
    if (typeof json !== 'undefined' && this.props.onChange) {
      this.props.onChange(json);
    }
  };

  render() {
    let {
      className, field, disabled, errorText
    } = this.props;

    let { help } = field;
    let inputError = '';

    className += ' mixed-field ';
    if (errorText) {
      className += this.state.style;
      help = errorText;
      inputError = 'is-invalid';
    }

    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;

    let label = field.nolabel ? '' : field.label;

    let inputElement;
    if (disabled || field.fixed) {
      inputElement = <pre>{this.state.text}</pre>;
    } else {
      inputElement = <textarea
        className={'form-control ' + inputError}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        value={this.state.text}
      />;
    }

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
