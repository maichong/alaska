import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps, api } from 'alaska-admin-view';
import * as tr from 'grackle';

type State = {
  max: number;
  error: string;
  multi: any;
};

export default class ImageFieldView extends React.Component<FieldViewProps, State> {
  imageInput: any;
  uploadQueue: File[];
  currentTask: File;

  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      max: props.field.multi ? (props.field.max || 1000) : 1,
      error: '',
      multi: ''
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
      let image = await api.post('/action', {
        query: {
          _model: 'alaska-image.Image',
          _action: 'create'
        },
        body: {
          driver: field.driver,
          file
        }
      });
      let item = field.plainName === 'mixed' ? image : image.url;
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

  handleAddImage = () => {
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

    _.forEach(this.imageInput.files, (file: File) => {
      if (value.length >= this.state.max || !file) return;
      let matchs = file.name.match(/\.(\w+)$/);
      if (!matchs) {
        nextState.error = 'Invalid image format';
        return;
      }
      let ext = matchs[1].replace('jpeg', 'jpg').toLowerCase();
      if ((field.allowed || ['jpg', 'png']).indexOf(ext) < 0) {
        nextState.error = 'Invalid image format';
        return;
      }

      if (file.size && file.size > field.maxSize) {
        nextState.error = 'Image exceeds the allowed size';
        return;
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
      className, field, value, disabled, errorText
    } = this.props;
    let { error, max } = this.state;
    if (!field.multi) {
      value = value ? [value] : [];
    }
    let items: React.ReactNode[] = [];
    let readonly = disabled || field.fixed;
    _.forEach(value, (item, index) => {
      let url = '';
      if (typeof item === 'string') {
        let matchs = item.match(/\.(\w+)$/i);
        url = item + ((field.thumbSuffix || '').replace('{EXT}', matchs ? matchs[1] : '') || '');
      } else {
        url = item.thumbUrl || item.url + ((field.thumbSuffix || '').replace('{EXT}', item.ext || '') || '');
      }
      items.push((
        <div key={index} className="image-field-item">
          <img alt="" src={url} />
          {
            readonly ? null : (
              <button
                className="btn btn-link btn-block"
                disabled={disabled}
                onClick={() => this.handleRemoveItem(item)}
              >{tr('Remove')}</button>
            )
          }
        </div>
      ));
    });
    if (items.length < max) {
      // 还未超出
      if (!readonly) {
        items.push((
          <div className="image-field-item image-field-add" key="add">
            <i className="fa fa-plus-square-o" />
            <input
              ref={(r) => {
                this.imageInput = r;
              }}
              multiple={this.state.multi}
              accept="image/png;image/jpg;"
              type="file"
              onChange={this.handleAddImage}
            />
          </div>
        ));
      }
    }

    if (!items.length && readonly) {
      items.push((
        <div className="image-field-item image-field-add" key="add">
          <i className="fa fa-picture-o" />
        </div>
      ));
    }

    let { help } = field;
    className += ' image-field';
    error = error || errorText;
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
