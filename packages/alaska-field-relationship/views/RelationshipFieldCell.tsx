import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as detailsRedux from 'alaska-admin-view/redux/details';
import { CellViewProps, Settings, DetailsState, StoreState, Service } from 'alaska-admin-view';

function nameToKey(name: string): string {
  if (!name) return '';
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (`${b}-${c.toLowerCase()}`)).toLowerCase();
}

interface Props extends CellViewProps {
  details: DetailsState;
  settings: Settings;
  loadDetails: Function;
}

class RelationshipFieldCell extends React.Component<Props> {
  shouldComponentUpdate(newProps: Props) {
    let { details, field } = this.props;

    let key = nameToKey(field.model);
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

  getLink(value: string): any {
    let { field, details, settings } = this.props;
    const modelId: string = field.model;
    if (!modelId) return null;
    let [serviceId, modelName] = modelId.split('.');
    let Model = null;
    let serviceModels: Service = settings.services[serviceId];
    if (serviceModels && serviceModels.models) {
      Model = serviceModels.models[modelName] || null;
    }
    if (!Model) return null;
    let { id } = Model;
    let title = value;
    if (value && details && details[id] && details[id][value]) {
      let modelTitleField = field.modelTitleField;
      title = details[id][value][modelTitleField] || value;
    } else if (!details[id] || !details[id][value]) {
      setTimeout(() => {
        this.props.loadDetails({
          model: modelId,
          id: value
        });
      });
      return null;
    }
    return (<Link
      key={value}
      to={`/edit/${serviceId}/${modelName}/${encodeURIComponent(value)}`}
    >{title}</Link>);
  }

  render() {
    let { value } = this.props;
    if (!value) {
      return <div className="relationship-field-cell" />;
    }
    let display;
    if (Array.isArray(value)) {
      let arr: Array<any> = [];
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

export default connect((
  { details, settings }: StoreState) => ({ details, settings }),
(dispatch) => ({
  loadDetails: bindActionCreators(detailsRedux.loadDetails, dispatch)
})
)(RelationshipFieldCell);
