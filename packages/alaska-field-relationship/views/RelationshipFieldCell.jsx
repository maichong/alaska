// @flow

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { loadDetails } from 'alaska-admin-view/redux/details';

class RelationshipFieldCell extends React.Component {

  props: {
    settings:Object;
    details:Object;
    loadDetails:Function;
  };

  state: {
    display:string
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      display: ''
    };
  }

  shouldComponentUpdate(props: Object) {
    let field = this.props.field;
    let key = field.key;
    let details = this.props.details;
    let value = props.value;
    if (!value) {
      return false;
    }
    if (value !== this.props.value) {
      return true;
    }
    if (!props.details[key] || !details[key]) {
      return true;
    }
    if (typeof value === 'string') {
      if (props.details[key][value] !== details[key][value]) {
        return true;
      }
    } else {
      for (let i of Object.keys(value)) {
        let id = value[i];
        if (props.details[key][id] !== details[key][id]) {
          return true;
        }
      }
    }
    return false;
  }

  getLink(value) {
    let field = this.props.field;
    let details = this.props.details;
    let Model = this.props.settings.models[field.ref];
    let key = field.key;
    let title = value;
    if (value && Model && details && details[key] && details[key][value]) {
      title = details[key][value][Model.titleField] || value;
    } else {
      setTimeout(() => {
        this.props.loadDetails({
          service: field.service,
          model: field.model,
          key,
          id: value
        });
      });
    }
    return <Link
      key={value}
      to={'/edit/' + field.service + '/' + field.model + '/' + encodeURIComponent(value)}
    >{title}</Link>;
  }

  render() {
    let value = this.props.value;
    if (!value) {
      return <div className="relationship-field-cell" />;
    }
    let display;
    if (Array.isArray(value)) {
      display = value.map((v, i) => this.getLink(v));
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
