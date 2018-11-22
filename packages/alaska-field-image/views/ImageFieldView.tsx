import * as React from 'react';
import * as _ from 'lodash';
import * as shallowEqualWithout from 'shallow-equal-without';
import upload from 'alaska-admin-view/utils/upload';
import { FieldViewProps } from 'alaska-admin-view';
import * as tr from 'grackle';

type State = {
  max: number;
  errorText: string;
  multi: any;
};

export default class ImageFieldView extends React.Component<FieldViewProps, State> {
  imageInput: any;

  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      max: props.field.multi ? (props.field.max || 1000) : 1,
      errorText: '',
      multi: ''
    };
  }

  componentWillReceiveProps(nextProps: FieldViewProps) {
    if (typeof nextProps.errorText !== 'undefined') {
      this.setState({
        errorText: nextProps.errorText
      });
    }
  }

  shouldComponentUpdate(props: FieldViewProps, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleAddImage = () => {
    let {
      model, field, record, value
    } = this.props;
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

    let id = '_new';
    if (record && record._id) {
      id = record._id;
    }
    let nextState = {
      errorText: ''
    };

    _.forEach(this.imageInput.files, (file) => {
      if (value.length >= this.state.max || !file) return;
      let matchs = file.name.match(/\.(\w+)$/);
      let temp: boolean = (field.allowed || ['jpg', 'png']).indexOf(matchs[1].replace('jpeg', 'jpg').toLowerCase()) < 0;
      if (!matchs || !matchs[1] || temp) {
        nextState.errorText = 'Invalid image format';
        return;
      }

      upload({
        file,
        model: model.id,
        field: field.path,
        id
      }).then((image) => {
        let item = field.plainName === 'mixed' ? image : image.url;
        value = value.concat(item);
        if (this.props.onChange) {
          this.props.onChange(multi ? value : item);
        }
      }, (error) => {
        this.setState({ errorText: error.message });
      });
    });
    this.setState(nextState);
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
      className, field, value, disabled
    } = this.props;
    let { errorText, max } = this.state;
    if (!field.multi) {
      value = value ? [value] : [];
    }
    let items: React.ReactNode[] = [];
    let readonly = disabled || field.fixed;
    _.forEach(value, (item, index) => {
      let url = '';
      if (typeof item === 'string') {
        url = item + (field.thumbSuffix || '');
      } else {
        url = item.thumbUrl || item.url + (field.thumbSuffix || '');
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
    if (errorText) {
      className += ' has-error';
      help = tr(errorText);
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;

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
