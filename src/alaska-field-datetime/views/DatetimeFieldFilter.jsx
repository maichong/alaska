// @flow

import React from 'react';
import PropTypes from 'prop-types';
import DateTime from 'react-datetime';
import moment from 'moment';

type State = {
  mode: 1 | 2 | 3 | 4,
  value1: moment,
  value2: moment,
  error: boolean
};

export default class DatetimeFieldFilter extends React.Component<Alaska$view$Field$Filter$Props, State> {
  static contextTypes = {
    t: PropTypes.func,
  };

  handleMode1: () => void;
  handleMode2: () => void;
  handleMode3: () => void;
  handleMode4: () => void;

  constructor(props: Alaska$view$Field$Filter$Props) {
    super(props);
    let value: {
      value1?: string,
      value2?: string,
      gte?: string,
      lte?: string,
      // $Flow
    } = props.value || {};
    if (typeof value === 'string') {
      value = { value1: value };
    }
    let mode = 1;
    let value1 = moment(value.value1);
    let value2 = moment();
    if (value.gte) {
      value1 = moment(value.gte);
      if (value.lte) {
        //区间
        value2 = moment(value.lte);
        mode = 4;
      } else {
        //大于
        mode = 2;
      }
    } else if (value.lte) {
      //小于
      mode = 3;
      value1 = moment(value.lte);
    }
    let error = false;
    if (!value1) {
      error = true;
    }
    if (mode === 4 && (!value2 || value1.isAfter(value2))) {
      error = true;
    }
    this.state = {
      mode, // 1 等于 2大于 3小于 4区间
      value1,
      value2,
      error
    };
    this.handleMode1 = this.handleMode.bind(this, 1);
    this.handleMode2 = this.handleMode.bind(this, 2);
    this.handleMode3 = this.handleMode.bind(this, 3);
    this.handleMode4 = this.handleMode.bind(this, 4);
  }

  handleMode(mode: 1 | 2 | 3 | 4) {
    this.setState({ mode }, () => this.handleBlur());
  }

  handleChange1 = (value: string) => {
    this.setState({
      value1: moment(value)
    }, () => this.handleBlur());
  };

  handleChange2 = (value: string) => {
    this.setState({
      value2: moment(value)
    }, () => this.handleBlur());
  };

  handleBlur = () => {
    let { mode, value1, value2 } = this.state;
    if (!value1) {
      this.setState({ error: true });
      return;
    }
    if (mode === 4 && (!value2 || value1.isAfter(value2))) {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    value1 = value1.format('YYYY-MM-DD');
    let filter = value1;
    if (mode === 2) {
      filter = { gte: value1 };
    } else if (mode === 3) {
      filter = { lte: value1 };
    } else if (mode === 4) {
      filter = { gte: value1, lte: value2.format('YYYY-MM-DD') };
    }
    this.props.onChange(filter);
  };

  render() {
    const { t } = this.context;
    let { className, field, onClose } = this.props;
    const {
      mode, value1, value2, error
    } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    let input2 = null;
    if (mode === 4) {
      input2 = <div className="form-group">
        <DateTime
          value={value2}
          dateFormat="YYYY-MM-DD"
          timeFormat={false}
          onChange={this.handleChange2}
        />
      </div>;
    }
    className += ' datetime-field-filter' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-xs-2 control-label text-right">{field.label}</label>
        <div className="form-inline col-xs-10">
          <div className="form-group btn-group">
            <a
              className={mode === 1 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode1}
            >{t('equal')}
            </a>
            <a
              className={mode === 2 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode2}
            >{t('greater')}
            </a>
            <a
              className={mode === 3 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode3}
            >{t('lesser')}
            </a>
            <a
              className={mode === 4 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode4}
            >{t('between')}
            </a>
          </div>
          <div className="form-group">
            <DateTime
              value={value1}
              dateFormat="YYYY-MM-DD"
              timeFormat={false}
              onChange={this.handleChange1}
            />
          </div>
          {input2}
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
