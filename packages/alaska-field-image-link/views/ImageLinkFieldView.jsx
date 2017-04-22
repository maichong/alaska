// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';
import { api } from 'alaska-admin-view';

export default class ImageLinkFieldView extends React.Component {

  static contextTypes = {
    settings: PropTypes.object,
    t: PropTypes.func
  };

  props: {
    className: string,
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: string | string[],
    onChange: Function,
  };

  state: {
    max: number,
    errorText: string,
    multi: any
  };

  imageInput: any;

  constructor(props: Object) {
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

  componentWillReceiveProps(nextProps: Object) {
    let newState = {};
    if (nextProps.errorText !== undefined) {
      newState.errorText = nextProps.errorText;
      this.setState(newState);
    }
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleAddImage = () => {
    const t = this.context.t;
    let { field, value } = this.props;
    let multi = field.multi;
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
    let [serviceId, modelName, path] = field.target.split('.');
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
          _model: modelName
        },
        body: { file, id, path: path }
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
    let { className, field, value, disabled } = this.props;
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
            >删除</button>
        }
      </div>);
    });
    if (items.length < max) {
      //还未超出
      if (!readonly) {
        items.push(<div className="image-field-item image-field-add" key="add">
          <i className="fa fa-plus-square-o" />
          <input
            ref={(r) => { this.imageInput = r; }}
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

    let help = field.help;
    className += ' image-field image-link-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? (<label className="control-label">{label}</label>) : null;
      return (
        <div className={className}>
          {labelElement}
          <div>{items}</div>
          {helpElement}
        </div>
      );
    }

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
}
