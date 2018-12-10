import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';
import { Controlled as CodeMirror, IInstance } from 'react-codemirror2';
import * as _ from 'lodash';
import 'codemirror/mode/javascript/javascript';

interface State {
  _value?: any;
  text: string;
  hasError: boolean;
}

export default class MixedFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      _value: props.value,
      text: JSON.stringify(props.value, null, 4),
      hasError: false
    };
  }

  static getDerivedStateFromProps(nextProps: FieldViewProps, prevState: State) {
    console.log('getDerivedStateFromProps', nextProps);
    if (!_.isEqual(nextProps.value, prevState._value)) {
      return {
        _value: nextProps.value,
        text: JSON.stringify(nextProps.value, null, 4)
      };
    }
    return null;
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (editor: any, data: any, value: string): void => {
    let state: State = {
      text: value,
      hasError: false
    };
    try {
      JSON.parse(value);
    } catch (error) {
      try {
        // eslint-disable-next-line
        eval(value);
      } catch (err) {
        state.hasError = true;
      }
    }
    console.log('setState', state);
    this.setState(state);
  };

  handleBlur = (editor: IInstance, event: Event): void => {
    let value = editor.getValue();
    let json;
    let state: State = {
      text: value,
      hasError: false
    };
    try {
      json = JSON.parse(value);
    } catch (error) {
      try {
        // eslint-disable-next-line
        eval('json=' + value);
      } catch (err) {
        state.hasError = true;
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
    if (errorText || this.state.hasError) {
      help = errorText;
      inputError = 'is-invalid';
    }

    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;

    let label = field.nolabel ? '' : field.label;

    let inputElement;
    if (disabled || field.fixed) {
      inputElement = <pre>{this.state.text}</pre>;
    } else {
      inputElement = <CodeMirror
        className={inputError}
        onBeforeChange={this.handleChange}
        onBlur={this.handleBlur}
        value={this.state.text}
        options={_.defaults({}, field.codeMirrorOptions, {
          mode: {
            name: 'javascript',
            json: true
          },
          lineNumbers: true,
          readOnly: disabled
        })}
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
