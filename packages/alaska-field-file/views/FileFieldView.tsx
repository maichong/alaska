import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import * as tr from 'grackle';
import * as prettyBytes from 'pretty-bytes';
import { FieldViewProps, api } from 'alaska-admin-view';

type State = {
  max: number;
  error: string;
};

export default class FileFieldView extends React.Component<FieldViewProps, State> {
  fileInput: any;
  uploadQueue: File[];
  currentTask: File;

  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      max: props.field.multi ? (props.field.max || 1000) : 1,
      error: '',
    };
    this.uploadQueue = [];
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  async upload() {
    const { field } = this.props;
    let file = this.uploadQueue.shift();
    if (!file) return;
    this.currentTask = file;
    try {
      let record = await api.post('/action', {
        query: {
          _model: 'alaska-file.File',
          _action: 'create'
        },
        body: {
          driver: field.driver,
          file
        }
      });
      let item = field.plainName === 'mixed' ? record : record.url;
      let { value, onChange } = this.props;
      if (field.multi) {
        value = (value || []).concat(item);
        onChange(value);
      } else {
        onChange(item);
      }
    } catch (e) {
      this.setState({ error: e.message });
    }
    this.currentTask = null;
    if (this.uploadQueue.length) {
      this.upload();
    }
  }

  handleAddFile = () => {
    let { field, value } = this.props;
    let { multi } = field;
    if (value) {
      if (!multi) {
        value = [value];
      } else {
        value = value.concat();
      }
    } else {
      value = [];
    }

    let nextState = {
      error: ''
    };

    _.forEach(this.fileInput.files, (file: File) => {
      if (value.length >= this.state.max || !file) return;

      if (file.size && file.size > field.maxSize) {
        nextState.error = 'File exceeds the allowed size';
        return;
      }

      if (field.allowed && field.allowed.length) {
        let filename = file.name.toLocaleLowerCase();
        if (!_.find(field.allowed, (ext) => filename.endsWith(`.${ext}`))) {
          nextState.error = 'Invalid file format';
          return;
        }
      }
      this.uploadQueue.push(file);
    });
    this.setState(nextState);
    if (this.uploadQueue.length && !this.currentTask) this.upload();
  };

  handleRemoveItem(item: any) {
    let value: any = null;
    if (this.props.field.multi) {
      value = [];
      _.forEach(this.props.value, (i) => {
        if (i !== item) {
          value.push(i);
        }
      });
    }
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    let {
      className, field, value, disabled, error: errorText
    } = this.props;
    let { error, max } = this.state;
    if (!field.multi) {
      value = value ? [value] : [];
    }
    let items: React.ReactNode[] = [];
    let readonly = disabled || field.fixed;
    _.forEach(value, (item, index) => {
      let file = item;
      if (typeof item === 'string') {
        file = { url: item };
      }
      items.push((
        <div key={index} className="file-field-item">
          {file.name && <b>{file.name}</b>}
          {file.size && <span>{prettyBytes(file.size)}</span>}
          <a target="_blank" href={file.url}>{tr('Download')}</a>
          {
            // eslint-disable-next-line no-script-url
            readonly ? null : <a href="javascript:void(0)" onClick={() => this.handleRemoveItem(item)}>{tr('Remove')}</a>
          }
        </div>
      ));
    });
    if (items.length < max) {
      // 还未超出
      if (!readonly) {
        items.push((
          <div className="file-field-add" key="add">
            <div className="btn btn-success"><i className="fa fa-cloud-upload" /> {tr('Upload')}</div>
            <input
              ref={(r) => {
                this.fileInput = r;
              }}
              multiple={field.multi}
              type="file"
              onChange={this.handleAddFile}
            />
          </div>
        ));
      }
    }

    if (!items.length && readonly) {
      items.push((
        <div className="file-field-add" key="add">
          <i className="fa fa-cloud-upload" />
        </div>
      ));
    }

    let { help } = field;
    className += ' file-field';
    error = error || errorText as string;
    if (error) {
      className += ' is-invalid';
      help = tr(error);
    }
    let helpElement = help ? <small className={error ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {items}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? (<label className="col-form-label">{label}</label>) : null}
        <div>{items}</div>
        {helpElement}
      </div>
    );
  }
}
