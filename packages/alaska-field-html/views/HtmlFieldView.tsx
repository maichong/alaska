import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { FieldViewProps, StoreState, Settings } from 'alaska-admin-view';

export interface Props extends FieldViewProps {
  settings?: Settings;
}

class HtmlFieldView extends React.Component<Props> {
  domEditor: any;
  id: string;

  componentDidMount() {
    // @ts-ignore
    if (this.id && typeof UE !== 'undefined') {
      // @ts-ignore
      let editor = UE.getEditor(this.id);
      editor.ready(() => {
        let value = this.props.value ? this.props.value : '<p></p>';
        editor.setContent(value);
      });
      editor.addListener('contentChange', () => {
        let { disabled } = this.props;
        if (disabled) return;
        let content = editor.getContent();
        this.props.onChange(content);
      });
    }
  }

  componentWillUnmount() {
    // @ts-ignore
    if (this.id && typeof UE !== 'undefined') {
      // @ts-ignore
      UE.delEditor(this.id);
    }
  }

  render() {
    let {
      className,
      error,
      field,
      value,
      disabled
    } = this.props;

    let readonly = disabled || field.fixed;

    let editor;
    if (readonly) {
      editor = (<div
        className="html-field-fixed p-2"
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />);
      // @ts-ignore
    } else if (typeof UE !== 'undefined') {
      if (!this.id) {
        this.id = `html-editor-${Math.random()}`;
      }
      editor = <script id={this.id} type="text/plain" style={{ width: '100%', height: '300px' }}></script>;
    } else {
      editor = <div className="form-control" style={{ border: 'none' }}>Missing UEditor</div>;
    }

    let { help } = field;
    className += ' html-field';
    if (error) {
      help = error as string;
    }
    let helpElement = help ? <small className={error ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-form-label col-sm-2">{label}</label>
          <div className="col-sm-10">
            {editor}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {editor}
        {helpElement}
      </div>
    );
  }
}

export default connect((state: StoreState) => ({ settings: state.settings }))(HtmlFieldView);
