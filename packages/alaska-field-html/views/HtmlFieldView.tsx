import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { FieldViewProps, StoreState, Settings } from 'alaska-admin-view';

export interface Props extends FieldViewProps {
  settings?: Settings;
}

interface HtmlState {
  id: string;
}

class HtmlFieldView extends React.Component<Props, HtmlState> {
  domEditor: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      id: new Date().getTime().toString()
    };
  }


  componentDidMount() {
    // @ts-ignore
    if (typeof UE !== 'undefined') {
      // @ts-ignore
      let editor = UE.getEditor(this.state.id);
      editor.ready(() => {
        let value = this.props.value ? this.props.value : '<p></p>';
        editor.setContent(value);
      });
      editor.addListener('contentChange', () => {
        let content = editor.getContent();
        this.props.onChange(content);
      });
    }
  }

  componentWillUnmount() {
    // @ts-ignore
    if (typeof UE !== 'undefined') {
      // @ts-ignore
      UE.delEditor(this.state.id);
    }
  }

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
      // @ts-ignore
    } else if (typeof UE !== 'undefined') {
      editor = <script id={this.state.id} type="text/plain" style={{ width: '100%', height: '300px' }}></script>;
    } else {
      editor = <div className="form-control" style={{ border: 'none' }}>Missing UEditor</div>;
    }

    let { help } = field;
    className += ' html-field';
    if (errorText) {
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;

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
