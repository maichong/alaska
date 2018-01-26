// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import shallowEqualWithout from 'shallow-equal-without';
import _ from 'lodash';

type State = {
  display: string
};

export default class NumberFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  static contextTypes = {
    t: PropTypes.func,
  };

  focused: boolean;

  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      display: props.value
    };
    if (props.field.format) {
      this.state.display = numeral(props.value).format(props.field.format);
    }
  }

  componentWillReceiveProps(nextProps: Alaska$view$Field$View$Props) {
    let newState = {};
    if (typeof nextProps.value !== 'undefined' || typeof nextProps.field.default === 'undefined') {
      if (this.focused || !nextProps.field.format) {
        //正在输入
        newState.display = nextProps.value;
      } else {
        //不在输入状态
        newState.display = numeral(nextProps.value).format(this.props.field.format);
      }
    }
    this.setState(newState);
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (event: SyntheticInputEvent<*>) => {
    let display = event.target.value;
    this.setState({ display });
  };

  handleFocus = () => {
    this.focused = true;
  };

  handleBlur = () => {
    this.focused = false;
    const { field } = this.props;
    let value = this.state.display;
    let unfomarted = numeral(value).value();
    if (_.isNaN(unfomarted)) {
      unfomarted = 0;
    }
    if (field.format) {
      this.setState({ display: numeral(unfomarted).format(field.format) });
    } else {
      this.setState({ display: String(unfomarted) });
    }
    if (unfomarted !== this.props.value) {
      if (this.props.onChange) {
        this.props.onChange(unfomarted);
      }
    }
  };

  render() {
    let {
      className,
      field,
      disabled,
      value,
      errorText,
      model
    } = this.props;
    const { t } = this.context;
    let { help } = field;
    className += ' number-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-static">{value}</p>;
    } else {
      let placeholder = field.placeholder ? t(field.placeholder, field.service || model.serviceId) : '';
      inputElement = (<input
        type="text"
        className="form-control"
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={this.state.display || ''}
        disabled={disabled}
        placeholder={placeholder}
      />);
      let addonAfter = field.addonAfter ?
        <span className="input-group-addon">{t(field.addonAfter, field.service || model.serviceId)}</span> : null;
      let addonBefore = field.addonBefore ?
        <span className="input-group-addon">{t(field.addonBefore, field.service || model.serviceId)}</span> : null;
      if (addonAfter || addonBefore) {
        inputElement = <div className="input-group">{addonBefore}{inputElement}{addonAfter}</div>;
      }
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 control-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? <label className="control-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
