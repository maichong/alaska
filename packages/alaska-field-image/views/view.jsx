// @flow

import React from 'react';
import _ from 'lodash';
import { shallowEqual } from 'alaska-admin-view';
import { api } from 'alaska-admin-view';
import { stringify } from 'qs';
// $Flow
import '../style.less';

const { bool, object, any, func, string } = React.PropTypes;

export default class ImageFieldView extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    data: object,
    errorText: string,
    disabled: bool,
    value: any,
    onChange: func,
  };

  static contextTypes = {
    settings: object,
    t: func
  };

  state: {
    max: number,
    errorText: string,
    multi: any
  };

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

  shouldComponentUpdate(props:Object, state:Object) {
    return !shallowEqual(props, this.props, 'data', 'onChange', 'model') || !shallowEqual(state, this.state);
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
      serviceId = model.service.id;
      modelName = model.name;
    }
    if (data && data._id) {
      id = data._id;
    }
    let url = this.context.settings.services['alaska-admin'].prefix +
      '/api/upload?' +
      stringify({ service: serviceId, model: modelName });
    let nextState = {
      errorText: ''
    };
    _.forEach(this.refs.imageInput.files, (file) => {
      if (value.length >= me.state.max || !file) return;
      let matchs = file.name.match(/\.(\w+)$/);
      let temp:boolean = (field.allowed || ['jpg', 'png']).indexOf(matchs[1].replace('jpeg', 'jpg').toLowerCase()) < 0;
      if (!matchs || !matchs[1] || temp) {
        nextState.errorText = t('Invalid image format');
        return;
      }
      api.post(url, {
        file,
        id,
        path: field.path || 'avatar'
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


  handleRemoveItem(item:any) {
    let multi = this.props.field.multi;
    let value:any[] = [];
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
        {readonly ? null : (<button
          className="btn btn-link btn-block" disabled={disabled}
          onClick={this.handleRemoveItem.bind(this, item)}
          >删除</button>)}
      </div>);
    });
    if (items.length < max) {
      //还未超出
      if (!readonly) {
        items.push(<div className="image-field-item image-field-add" key="add">
          <i className="fa fa-plus-square-o" />
          <input
            ref="imageInput"
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
