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

function nameToKey(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (b + '-' + c.toLowerCase())).toLowerCase();
}

class RelationshipFieldCell extends React.Component<Props> {
  shouldComponentUpdate(newProps: Props) {
    let { details, field } = this.props;

    // $Flow
    let key = nameToKey(field.ref);
    if (!key) return false;

    let { value } = newProps;
    if (!value) {
      return false;
    }
    if (value !== this.props.value) {
      return true;
    }
    if (!newProps.details[key]) {
      return true;
    }
    if (Array.isArray(value)) {
      for (let id of value) {
        if (!details[key]) {
          return !!(newProps.details[key]);
        }
        if (newProps.details[key][id] !== details[key][id]) {
          return true;
        }
      }
    }
    if (typeof value === 'string' || typeof value === 'number') {
      if (!details[key]) {
        return !!(newProps.details[key] && newProps.details[key][value]);
      }
      if (newProps.details[key][value] !== details[key][value]) {
        return true;
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
    } else if (!details[key] || !details[key][value]) {
      setTimeout(() => {
        this.props.loadDetails({
          service: refServiceId,
          model: refModelName,
          key,
          id: value
        });
      });
      return null;
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
