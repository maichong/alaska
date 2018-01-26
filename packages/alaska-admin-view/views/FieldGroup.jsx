// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import checkDepends from 'check-depends';
import type { Props } from 'alaska-admin-view/views/FieldGroup';
import Node from './Node';
import parseAbility from '../utils/parse-ability';

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

  fieldRefs = {};

  renderFields(disabled: boolean) {
    const { t, settings, views } = this.context;
    let fields = [];
    const { props } = this;
    const {
      record, errors, model, onFieldChange, isNew, horizontal
    } = props;
    const { serviceId } = model;
    _.forEach(props.fields, (field) => {
      let { ability } = field;
      let abilityDisabled = false;
      if (typeof ability === 'function') {
        ability = ability(record, settings.user);
      }
      if (ability && ability[0] === '*') {
        ability = ability.substr(1);
        abilityDisabled = true;
      }
      let hasAbility = !ability || settings.abilities[ability] || false;
      if (
        (!field.view)
        || (field.path === '_id' && !isNew)
        || (!hasAbility && !abilityDisabled)
        || checkDepends(field.hidden, record)
        || (field.depends && !checkDepends(field.depends, record))
        || (!settings.superMode && checkDepends(field.super, record))
      ) {
        delete this.fieldRefs[field.path];
        return;
      }

      let ViewClass = views[field.view];
      if (!ViewClass) {
        console.warn('Missing : ' + field.view);
        ViewClass = views.TextFieldView;
      }

      let fieldDisabled = disabled;
      if (!fieldDisabled && !hasAbility) {
        fieldDisabled = abilityDisabled;
      }
      if (!fieldDisabled) {
        fieldDisabled = checkDepends(field.disabled, record);
      }

      let label = t(field.label, serviceId);
      let help = t(field.help, serviceId);

      // $Flow
      fields.push(React.createElement(ViewClass, {
        key: field.path,
        value: record[field.path],
        ref: (r) => {
          this.fieldRefs[field.path] = r;
        },
        model,
        record,
        field: _.assign({ horizontal }, field, { help, label }),
        disabled: fieldDisabled,
        errorText: errors[field.path],
        onChange: (value) => onFieldChange(field.path, value),
        className: 'form-group ' + model.id + '-' + field.path + '-view'
      }));
    });
    if (!fields.length) return null;
    return (
      <Node wrapper="groupFieldList">{fields}</Node>
    );
  }

  render() {
    const { t, settings } = this.context;
    const { props } = this;
    const {
      path, title, panel, form, wrapper, style, disabled, model, record, isNew, horizontal
    } = props;

    let { ability } = props;
    let abilityDisabled = false;
    if (typeof ability === 'function') {
      ability = ability(record, settings.user);
    }
    if (ability && ability[0] === '*') {
      ability = ability.substr(1);
      abilityDisabled = true;
    }
    let hasAbility = !ability || settings.abilities[ability] || false;
    if (!hasAbility && !abilityDisabled) return ''; // ability
    if (checkDepends(props.hidden, record)) return ''; // hidden
    if (props.depends && !checkDepends(props.depends, record)) return ''; // depends
    if (!settings.superMode && checkDepends(props.super, record)) return ''; // super

    function isDisabled(): boolean {
      if (disabled || abilityDisabled) return true;
      let action = '';
      if (isNew) {
        if (model.nocreate) return true;
        action = 'create';
      } else {
        if (model.noupdate) return true;
        action = 'update';
      }
      let actionAbility = _.get(model, `actions.${action}.ability`);
      actionAbility = parseAbility(actionAbility, record, settings.user);
      if (actionAbility) {
        if (!settings.abilities[actionAbility]) return true;
      } else if (!model.abilities[action]) return true;
      if (checkDepends(props.disabled, record)) return true;
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
