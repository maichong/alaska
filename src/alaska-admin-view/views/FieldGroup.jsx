// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import checkDepends from 'check-depends';
import type { DependsQueryExpression } from 'check-depends';
import Node from './Node';

type Props = {
  path: string,
  loading: boolean,
  model: Alaska$view$Model,
  record: Alaska$view$Record,
  isNew: boolean,
  id: string,
  fields: Alaska$view$Field[],
  title: string,
  errors: {},
  onFieldChange: Function,
  form?: boolean,
  panel?: boolean,
  style?: Alaska$style,
  wrapper?: string, // 自定义Wrapper占位符
  ability?: string,
  super?: DependsQueryExpression,
  hidden?: DependsQueryExpression,
  depends?: DependsQueryExpression,
  disabled?: DependsQueryExpression,
};

export default class FieldGroup extends React.Component<Props> {
  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func
  };

  context: {
    settings: Alaska$view$Settings,
    views: Alaska$view$Views,
    t: Function
  };

  renderFields(disabled: boolean) {
    const { t, settings, views } = this.context;
    let fields = [];
    const { props } = this;
    const {
      record, errors, model, onFieldChange
    } = props;
    const { serviceId } = model;
    _.forEach(props.fields, (field) => {
      if (!field.view) return;
      if (field.ability && !settings.abilities[field.ability]) return;
      if (checkDepends(field.hidden, record)) return;
      if (field.depends && !checkDepends(field.depends, record)) return;
      if (!settings.superMode && checkDepends(field.super, record)) return;

      let ViewClass = views[field.view];
      if (!ViewClass) {
        console.warn('Missing : ' + field.view);
        ViewClass = views.TextFieldView;
      }

      let fieldDisabled = disabled;
      if (!fieldDisabled) {
        fieldDisabled = checkDepends(field.disabled, record);
      }

      let label = t(field.label, serviceId);
      let help = t(field.help, serviceId);

      // $Flow
      fields.push(React.createElement(ViewClass, {
        key: field.path,
        value: record[field.path],
        model,
        record,
        field: _.assign({}, field, { label, help }),
        disabled: fieldDisabled,
        errorText: errors[field.path],
        onChange: (value) => onFieldChange(field.path, value),
        className: 'form-group ' + model.id + '-' + field.path + '-view'
      }));
    });
    return (
      <Node wrapper="groupFieldList">{fields}</Node>
    );
  }

  render() {
    const { t, settings } = this.context;
    const { props } = this;
    const {
      path, title, panel, form, wrapper, style, loading, model, record, isNew
    } = props;
    if (props.ability && !settings.abilities[props.ability]) return 'ability'; // ability
    if (checkDepends(props.hidden, record)) return 'hidden'; // hidden
    if (props.depends && !checkDepends(props.depends, record)) return 'depends'; // depends
    if (!settings.superMode && checkDepends(props.super, record)) return 'super'; // super

    let disabled = loading;
    if (!disabled) {
      disabled = checkDepends(props.disabled, record);
      if (!disabled) {
        let canSave = (isNew && model.abilities.create) || (!isNew && model.abilities.update && !model.noupdate);
        disabled = !canSave;
      }
    }

    let el = this.renderFields(disabled);
    if (form !== false) {
      el = <div className="field-group-form form-horizontal">
        {el}
      </div>;
    }
    if (panel !== false) {
      let heading = title ? <div className="panel-heading">{t(title)}</div> : null;
      el = (
        <div className={model.id + '-group-' + path + ' field-group-panel panel panel-' + (style || 'default')}>
          {heading}
          <div className="panel-body">{el}</div>
        </div>
      );
    }

    el = <Node wrapper="group">{el}</Node>;

    if (wrapper) {
      return <Node wrapper={wrapper} props={this.props}>{el}</Node>;
    }
    return el;
  }
}
