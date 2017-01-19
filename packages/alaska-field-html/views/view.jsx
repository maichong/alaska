// @flow

import React from 'react';
import { shallowEqual } from 'alaska-admin-view';
import Simditor from 'simditor';
import 'simditor/styles/simditor.css';

const { bool, object, func, string } = React.PropTypes;

export default class HtmlFieldView extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    data: object,
    errorText: string,
    disabled: bool,
    value: string,
    onChange: func,
  };

  static contextTypes = {
    settings: object,
  };

  _editor: any;
  _textarea: any;

  constructor(props: Object) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  shouldComponentUpdate(props: Object) {
    return !shallowEqual(props, this.props, 'data', 'model');
  }

  componentWillUnmount() {
    if (this._editor) {
      this._editor.destroy();
    }
    delete this._editor;
    delete this._textarea;
  }

  init() {
    if (this._textarea && this._textarea !== this.refs.editor && this._editor) {
      this._editor.destroy();
      // $Flow 用完即删的属性
      delete this._editor;
      // $Flow 用完即删的属性
      delete this._textarea;
    }
    // $Flow 用完即删的属性
    if (!this._editor && this.refs.editor) {
      let { defaultImage, upload } = this.props.field;
      let uploadConfig;
      if (upload) {
        let adminService = this.context.settings.services['alaska-admin'];
        uploadConfig = {
          url: `${adminService.prefix}/api/upload?service=${upload.service}&model=${upload.model}&editor=1`,
          fileKey: 'file',
          params: {
            path: upload.path
          },
          leaveConfirm: upload.leaveConfirm
        };
      }
      // $Flow 用完即删的属性
      this._textarea = this.refs.editor;
      // $Flow 用完即删的属性
      this._editor = new Simditor({
        textarea: this.refs.editor,
        defaultImage,
        upload: uploadConfig,
        toolbar: [
          'title',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'fontScale',
          'color',
          '|',
          'ol',
          'ul',
          'blockquote',
          'code',
          'table',
          '|',
          'link',
          'image',
          '|',
          'indent',
          'outdent',
          'alignment',
          'hr'
        ]
      });
      // $Flow 用完即删的属性
      this._editor.on('valuechanged', this.handleChange);
    }
    // $Flow 用完即删的属性
    if (this._editor && this._editor.getValue() !== this.props.value) {
      // $Flow 用完即删的属性
      this._editor.setValue(this.props.value || '');
    }
  }

  handleChange = () => {
    if (this.props.onChange) {
      // $Flow 用完即删的属性
      let value = this._editor.getValue();
      if (value !== this.props.value) {
        this.props.onChange(value);
      }
    }
  };

  render() {
    let {
      errorText,
      field,
      value
    } = this.props;

    let readonly = field.disabled || field.static;

    let editor;
    if (readonly) {
      editor = (<div
        dangerouslySetInnerHTML={{ __html: value || '' }}
        style={{
          padding: 10,
          border: '2px solid #e7e9ec',
          borderRadius: 6
        }}
      />);
    } else {
      this.init();
      editor = <textarea ref="editor"/>;
    }

    let help = field.help;
    let className = 'form-group html-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? (
          <label className="control-label">{label}</label>
        ) : null;
      return (
        <div className={className}>
          {labelElement}
          {editor}
          {helpElement}
        </div>
      );
    }

    return (
      <div className={className}>
        <label className="control-label col-sm-2">{label}</label>
        <div className="col-sm-10">
          {editor}
          {helpElement}
        </div>
      </div>
    );
  }
}
