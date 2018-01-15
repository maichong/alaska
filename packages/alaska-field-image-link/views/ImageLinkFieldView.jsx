// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';
import { api } from 'alaska-admin-view';

type State = {
  max: number,
  errorText: string,
  multi: any
};

export default class ImageLinkFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  imageInput: any;

  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      max: props.field.max || 1000,
      errorText: '',
      multi: ''
    };
    if (!props.field.multi) {
      this.state.max = 1;
    }
  }

  componentWillReceiveProps(nextProps: Alaska$view$Field$View$Props) {
    let newState = {};
    if (nextProps.errorText !== undefined) {
      newState.errorText = nextProps.errorText;
      this.setState(newState);
    }
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleAddImage = () => {
    const { t } = this.context;
    let { field, value } = this.props;
    let { multi, target } = field;
    if (value) {
      if (!multi) {
        // $Flow
        value = [value];
      } else {
        value = value.concat();
      }
    } else {
      value = [];
    }
    let [serviceId, modelName] = (target || '').split('.');
    let id = '_new';
    let nextState = {
      errorText: ''
    };
    _.forEach(this.imageInput.files, (file) => {
      if (value.length >= this.state.max || !file) return;
      let matchs = file.name.match(/\.(\w+)$/);
      let temp: boolean = (field.allowed || ['jpg', 'png']).indexOf(matchs[1].replace('jpeg', 'jpg').toLowerCase()) < 0;
      if (!matchs || !matchs[1] || temp) {
        nextState.errorText = t('Invalid image format');
        return;
      }
      api.upload('/api/upload', {
        params: {
          _service: serviceId,
          _model: modelName,
          _path: field.path || 'avatar',
        },
        body: { file, id }
      }).then((res) => {
        value = value.concat(res.url);
        if (this.props.onChange) {
          this.props.onChange(multi ? value : res.url);
        }
      }, (error) => {
        this.setState({ errorText: error.message });
      });
    });
    this.setState(nextState);
  };

  handleRemoveItem(item: any) {
    let multi = this.props.field.multi;
    let value = null;
    if (multi) {
      value = [];
      // $Flow 我们知道此处props.value为数组
      _.forEach(this.props.value, (i) => {
        if (i !== item) {
          // $Flow 我们知道此处value为数组
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
    let thumbSuffix = field.thumbSuffix || '';
    let items = [];
    let readonly = disabled || field.fixed;
    // $Flow 和lodash的flow不匹配
    _.forEach(value, (item: string) => {
      items.push(<div key={item} className="image-field-item">
        <img alt="" src={item + thumbSuffix} />
        {
          readonly ? null : <button
            className="btn btn-link btn-block"
            disabled={disabled}
            onClick={() => this.handleRemoveItem(item)}
          >删除
          </button>
        }
      </div>);
    });
    if (items.length < max) {
      //还未超出
      if (!readonly) {
        items.push(<div className="image-field-item image-field-add" key="add">
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
        </div>);
      }
    }

    if (!items.length && readonly) {
      items.push(<div className="image-field-item image-field-add" key="add">
        <i className="fa fa-picture-o" />
      </div>);
    }

    let { help } = field;
    className += ' image-field image-link-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 control-label">{label}</label>
          <div className="col-sm-10">
            {items}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? (<label className="control-label">{label}</label>) : null}
        <div>{items}</div>
        {helpElement}
      </div>
    );
  }
}
