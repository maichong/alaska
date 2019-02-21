import * as React from 'react';
import * as _ from 'lodash';
import * as tr from 'grackle';
import * as immutable from 'seamless-immutable';
import { confirm } from '@samoyed/modal';
import { FieldViewProps, store, Record, ErrorsObject } from 'alaska-admin-view';
import Editor from 'alaska-admin-view/views/Editor';

interface State {
  actived: number;
}

export default class SubdocFieldView extends React.Component<FieldViewProps, State> {
  constructor(props: FieldViewProps) {
    super(props);
    this.state = {
      actived: 0
    };
  }

  handleChange = (newValue: immutable.Immutable<Record>, error: immutable.Immutable<ErrorsObject>) => {
    let { value, field, onChange } = this.props;
    let { actived } = this.state;
    if (field.multi) {
      if (!value) value = [];
      if (!_.isArray(value) && _.isObject(value)) value = [value];
      value = immutable(value).set(actived, newValue);
      onChange(value, error || null);
    } else {
      onChange(newValue, error || null);
    }
  };

  handleRemove = async () => {
    let { value, onChange, model } = this.props;
    let { actived } = this.state;
    if (!await confirm(tr('Confirm to remove the item?', model.serviceId))) return;
    value = value.flatMap((item: any, index: number) => (index === actived ? [] : [item]));
    onChange(value);
    if (actived > value.length - 1) {
      this.setState({ actived: value.length - 1 });
    }
  };

  handleAdd = () => {
    let { value, onChange } = this.props;
    value = immutable(value || []).concat({});
    onChange(value);
    this.setState({ actived: value.length - 1 });
  };

  renderTabs() {
    let {
      value,
      field
    } = this.props;
    let { actived } = this.state;
    let tabs: React.ReactNode[] = [];
    let model = store.getState().settings.models[field.model];

    _.forEach(value, (item, index: number) => {
      let title: React.ReactNode = `#${index + 1}`;
      if (model && model.titleField && item[model.titleField]) {
        title = item[model.titleField];
      }
      tabs.push(<li
        key={index}
        className={actived === index ? 'active' : ''}
        onClick={() => this.setState({ actived: index })}
      >
        {title}
      </li>);
    });

    return <ul className="subdoc-tabs">{tabs}</ul>;
  }

  renderActions() {
    const { value } = this.props;
    const { actived } = this.state;
    return (
      <div className="subdoc-actions">
        {value && value[actived] && <i className="fa fa-close text-danger" onClick={this.handleRemove} />}
        <i className="fa fa-plus-square text-success" onClick={this.handleAdd} />
      </div>
    );
  }

  render() {
    let {
      className,
      disabled,
      value,
      field,
      model,
      error
    } = this.props;
    let { actived } = this.state;

    className += ' subdoc-field card';

    let form;
    let refModel = store.getState().settings.models[field.model];

    if (field.multi) {
      if (!value) value = [];
      if (!_.isArray(value) && _.isObject(value)) value = [value];
      if (!value.length) {
        form = <div className="text-center">
          {tr('No item', model.serviceId)}
          <button className="btn btn-sm btn-success ml-2" onClick={this.handleAdd}>{tr('Create', model.serviceId)}</button>
        </div>;
      }
      value = value[actived] || {};
    }

    if (!form && refModel) {
      form = <Editor
        embedded
        model={refModel}
        record={immutable(value)}
        errors={error as immutable.Immutable<ErrorsObject>}
        onChange={this.handleChange}
        disabled={disabled}
      />;
    }

    return (
      <div className={className.replace(' row ', ' ')}>
        <div className="card-heading row">
          {field.label}
          {field.multi && this.renderTabs()}
          {field.multi && !disabled && this.renderActions()}
        </div>
        <div className="card-body">{form}</div>
      </div>
    );
  }
}
