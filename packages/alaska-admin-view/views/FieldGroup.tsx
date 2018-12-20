import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import Node from './Node';
import { connect } from 'react-redux';
import checkAbility from '../utils/check-ability';
import { FieldGroupProps, Settings, StoreState, views } from '..';

interface Props extends FieldGroupProps {
  settings: Settings;
}

class FieldGroup extends React.Component<Props> {
  static defaultProps = {
    horizontal: true
  };

  fieldRefs: any = {};

  renderFields(disabled: boolean) {
    const { props } = this;
    const {
      fields: propFields,
      record,
      model,
      horizontal,
      onFieldChange,
      errors: propsErrors,
      settings
    } = props;
    const { serviceId } = model;
    let fields: any = [];
    let errors: any = propsErrors;
    _.forEach(propFields, (field) => {
      let fieldClasses: string[] = ['form-group', `${model.id}-${field.path}-view`];
      if (horizontal) fieldClasses.push('row');

      if (
        (!field.view)
        || checkAbility(field.hidden, record)
        || (!settings.superMode && checkAbility(field.super, record))
      ) {
        delete this.fieldRefs[field.path];
        return;
      }

      let ViewClass = views.components[field.view];
      if (!ViewClass) {
        console.error(`Missing : ${field.view}`);
        ViewClass = views.components.TextFieldView;
      }

      let fieldDisabled = disabled;
      if (!fieldDisabled && field.disabled) {
        fieldDisabled = checkAbility(field.disabled, record);
      }

      let label = tr(field.label, serviceId);
      let help = tr(field.help, serviceId);
      let value: any = record[field.path];
      let fixed = checkAbility(field.fixed, record);
      if (fixed) {
        fieldClasses.push('fixed');
      }
      if (fieldDisabled) {
        fieldClasses.push('disabled');
      }
      fields.push(React.createElement(ViewClass, {
        key: field.path,
        // @ts-ignore 自定义Props
        value,
        ref: (r) => {
          this.fieldRefs[field.path] = r;
        },
        model,
        record,
        field: _.assign({ horizontal }, field, {
          help,
          label,
          fixed
        }),
        disabled: fieldDisabled,
        locale: settings.locale,
        errorText: errors[field.path],
        onChange: (value: any) => onFieldChange(field.path, value),
        className: fieldClasses.join(' ')
      }));
    });
    if (!fields.length) return null;
    return <Node
      className="field-group-list"
      wrapper="FieldGroup"
      props={this.props}
    >
      {fields}
    </Node>;
  }

  render() {
    const { props } = this;
    const {
      record,
      model,
      horizontal,
      form,
      panel,
      title,
      path,
      settings,
      wrapper
    } = props;

    if (checkAbility(props.hidden, record)) return ''; // hidden
    if (!settings.superMode && checkAbility(props.super, record)) return ''; // super
    function isDisabled(): boolean {
      if (record.isNew) {
        if (model.nocreate) return true;
      } else {
        if (model.noupdate) return true;
      }
      if (checkAbility(props.disabled, record)) return true;
      return false;
    }
    let el = this.renderFields(isDisabled());
    if (!el) return null;
    if (form !== false) {
      let className = 'field-group-form form';
      if (horizontal) {
        className += ' form-horizontal';
      }
      el = <div className={className}>
        {el}
      </div>;
    }
    if (panel !== false) {
      let heading = title ? <div className="card-title">{tr(title)}</div> : null;
      el = (
        <div className={`${model.id}-group-${path} card`}>
          {heading}
          <div className="card-body">{el}</div>
        </div>
      );
    } else {
      // el = <div className="card"><div className="card-body">{el}</div></div>;
    }
    el = <Node wrapper="FieldGroup" className="field-group" props={this.props}>{el}</Node>;
    if (wrapper) {
      return <Node
        wrapper={wrapper}
        props={this.props}
      >
        {el}
      </Node>;
    }
    return el;
  }
}
export default connect(({ settings }: StoreState) => ({ settings }))(FieldGroup);
