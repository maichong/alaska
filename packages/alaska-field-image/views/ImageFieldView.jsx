// @flow

import React from 'react';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';
import { api } from 'alaska-admin-view';

const { object, func } = React.PropTypes;

export default class ImageFieldView extends React.Component {

  static contextTypes = {
    settings: object,
    t: func
  };

  props: {
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
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
    let me = this;
    const t = this.context.t;
    let { model, field, data, value } = this.props;
    let multi = field.multi;
    if (value) {
      if (!multi) {
        value = [value];
      } else {
        value = value.concat();
      }
    } else {
      value = [];
    }
    let serviceId = 'alaska-user';
    let modelName = 'User';
    let id = '_new';
    if (model) {
      serviceId = model.serviceId;
      modelName = model.name;
    }
    if (data && data._id) {
      id = data._id;
    }
    let nextState = {
      errorText: ''
    };
    _.forEach(this.imageInput.files, (file) => {
      if (value.length >= me.state.max || !file) return;
      let matchs = file.name.match(/\.(\w+)$/);
      let temp: boolean = (field.allowed || ['jpg', 'png']).indexOf(matchs[1].replace('jpeg', 'jpg').toLowerCase()) < 0;
      if (!matchs || !matchs[1] || temp) {
        nextState.errorText = t('Invalid image format');
        return;
      }
      let data = new FormData();
      data.append('file', file);
      data.append('id', id);
      data.append('path', field.path || 'avatar');
      api.post('/api/upload', {
        params: {
          _service: serviceId,
          _model: modelName
        },
        body: data
      }).then((res) => {
        value.push(res);
        if (me.props.onChange) {
          me.props.onChange(multi ? value : res);
        }
      }, (error) => {
        me.setState({ errorText: error.message });
      });
    });
    this.setState(nextState);
  };

  handleRemoveItem(item: any) {
    let multi = this.props.field.multi;
    let value: any[] = [];
    if (multi) {
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
    let { field, value, disabled } = this.props;
    let { errorText, max } = this.state;
    if (!field.multi) {
      value = value ? [value] : [];
    }
    let items = [];
    let readonly = disabled || field.fixed;
    // $Flow 和lodash的flow不匹配
    _.forEach(value, (item, index) => {
      items.push(<div key={index} className="image-field-item">
        <img alt="" src={item.thumbUrl} />
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
    let className = 'form-group image-field';
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
