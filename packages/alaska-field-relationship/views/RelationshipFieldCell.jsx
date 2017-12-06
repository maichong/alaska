// @flow

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadDetails } from 'alaska-admin-view/redux/details';

type Props = {
  +model: Alaska$view$Model,
  +field: Alaska$view$Field,
  +value: any,
  settings: Alaska$view$Settings,
  details: Alaska$view$details,
  loadDetails: Function
};

class RelationshipFieldCell extends React.Component<Props> {
  shouldComponentUpdate(newProps: Props) {
    let { details, model } = this.props;
    let { key } = model;
    let { value } = newProps;
    if (!value) {
      return false;
    }
    if (value !== this.props.value) {
      return true;
    }
    if (!newProps.details[key] || !details[key]) {
      return true;
    }
    if (typeof value === 'string') {
      if (newProps.details[key][value] !== details[key][value]) {
        return true;
      }
    } else {
      for (let i of Object.keys(value)) {
        let id = value[i];
        if (newProps.details[key][id] !== details[key][id]) {
          return true;
        }
      }
    }
    return false;
  }

  getLink(value: string) {
    let { field, details, settings } = this.props;
    // $Flow 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (!ref) return null;
    let Model = settings.models[ref];
    let { key } = Model;
    let title = value;
    let [refServiceId, refModelName] = ref.split('.');
    if (value && details && details[key] && details[key][value]) {
      title = details[key][value][Model.titleField] || value;
    } else {
      setTimeout(() => {
        this.props.loadDetails({
          service: refServiceId,
          model: refModelName,
          key,
          id: value
        });
      });
    }
    return (<Link
      key={value}
      to={'/edit/' + refServiceId + '/' + refModelName + '/' + encodeURIComponent(value)}
    >{title}</Link>);
  }

  render() {
    let { value } = this.props;
    if (!value) {
      return <div className="relationship-field-cell" />;
    }
    let display;
    if (Array.isArray(value)) {
      let arr = [];
      value.forEach((v) => {
        if (arr.length) {
          arr.push(' , ');
        }
        arr.push(this.getLink(v));
      });
      display = arr;
    } else {
      display = this.getLink(value);
    }
    return (
      <div className="relationship-field-cell">{display}</div>
    );
  }
}

export default connect(({ details, settings }) => ({ details, settings }), (dispatch) => ({
  loadDetails: bindActionCreators(loadDetails, dispatch)
}))(RelationshipFieldCell);
