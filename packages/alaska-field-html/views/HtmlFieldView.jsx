// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import Simditor from 'simditor';

export default class HtmlFieldView extends React.Component<Alaska$view$Field$View$Props> {
  static contextTypes = {
    settings: PropTypes.object,
  };
  _editor: any;
  _textarea: any;

  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props) {
    return !shallowEqualWithout(props, this.props, 'record', 'model');
  }

  componentWillUnmount() {
    if (this._editor) {
      this._editor.destroy();
    }
    delete this._editor;
    delete this._textarea;
  }

  init() {
    if (this._editor) {
      // 如果已经存在之前的editor
      return;
    }
    if (!this._editor && this._textarea) {
      let { defaultImage, upload } = this.props.field;
      let uploadConfig;
      if (upload) {
        let adminService = this.context.settings.services['alaska-admin'];
        uploadConfig = {
          // eslint-disable-next-line
          url: `${adminService.prefix}/api/upload?_service=${upload.service}&_model=${upload.model}&_path=${upload.path}&_editor=1`,
          fileKey: 'file',
          leaveConfirm: upload.leaveConfirm
        };
      }
      this._editor = new Simditor({
        textarea: this._textarea,
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
      this._editor.on('valuechanged', this.handleChange);
    }
    if (this._editor && this._editor.getValue() !== this.props.value) {
      this._editor.setValue(this.props.value || '');
    }
  }

  handleChange = () => {
    if (this.props.onChange) {
      let value = this._editor.getValue();
      if (value !== this.props.value) {
        this.props.onChange(value);
      }
    }
  };

  render() {
    let {
      className,
      errorText,
      field,
      value
    } = this.props;

    let readonly = field.disabled || field.fixed;

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
      editor = <textarea
        ref={(r) => {
          this._textarea = r;
          this.init();
        }}
      />;
    }

    let { help } = field;
    className += ' html-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
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
    return (
      <div className={className}>
        {label ? <label className="control-label">{label}</label> : null}
        {editor}
        {helpElement}
      </div>
    );
  }
}
