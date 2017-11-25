// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';

export default class GeoFieldView extends React.Component<Alaska$view$Field$View$Props> {
  static contextTypes = {
    t: PropTypes.func,
  };

  shouldComponentUpdate(props: Alaska$view$Field$View$Props) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
  }

  render() {
    let {
      className,
      field,
      value,
      errorText
    } = this.props;
    const { t } = this.context;
    let { help } = field;
    className += ' geo-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;

    if (value && value[0]) {
      value = <a
        href={
          'http://m.amap.com/navi/?dest=' + value[0] + ',' + value[1]
          + '&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd'
        }
        target="_blank"
        rel="noopener noreferrer"
      >{t('LNG')}:{value[0]} {t('LAT')}:{value[1]}
      </a>;
    } else {
      value = null;
    }
    inputElement = <p className="form-control-static">{value}</p>;
    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? <label className="control-label">{label}</label> : null;
      return (
        <div className={className}>
          {labelElement}
          {inputElement}
          {helpElement}
        </div>
      );
    }

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
}
