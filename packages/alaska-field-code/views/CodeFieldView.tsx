import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';
import { Controlled as CodeMirror } from 'react-codemirror2';
import * as _ from 'lodash';

export default class CodeFieldView extends React.Component<FieldViewProps> {
  shouldComponentUpdate(props: FieldViewProps) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
  }

  handleChange = (editor: any, data: any, value: string) => {
    const { disabled, onChange } = this.props;
    if (!disabled && onChange) {
      onChange(value);
    }
  };

  render() {
    let {
      className,
      field,
      value,
      disabled,
      errorText
    } = this.props;
    let { help } = field;
    className += ' code-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{value}</p>;
    } else {
      inputElement = <CodeMirror
        onBeforeChange={this.handleChange}
        value={value || ''}
        options={_.defaults({}, field.codeMirrorOptions, {
          lineNumbers: true,
          readOnly: disabled
        })}
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
