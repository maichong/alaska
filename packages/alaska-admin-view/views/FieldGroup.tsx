import * as _ from 'lodash';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import * as checkDepends from 'check-depends';
import Node from './Node';
import { connect } from 'react-redux';
import parseAbility from '../utils/parse-ability';
import { FieldGroupProps, Settings, StoreState } from '..';

interface FieldGroupState {
}

interface Props extends FieldGroupProps {
  settings: Settings;
}

class FieldGroup extends React.Component<Props, FieldGroupState> {
  static defaultProps = {
    horizontal: true
  };

  static contextTypes = {
    views: PropTypes.object
  };

  fieldRefs: any = {};

  context: any;
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  renderFields(disabled: boolean) {
    const { views } = this.context;
    const { props } = this;
    const {
      fields: propFields,
      record,
      model,
      horizontal,
      onFieldChange,
      errors: propsErrors,
      isNew,
      settings
    } = props;
    const { serviceId } = model;
    let fields: any = [];
    let errors: any = propsErrors;
    _.forEach(propFields, (field) => {
      let { ability } = field;
      let abilityDisabled = false;
      let fieldClasses: string[] = ['form-group', model.id + '-' + field.path + '-view'];
      if (horizontal) fieldClasses.push('row');
      // if (typeof ability === 'function') {
      //   ability = ability(record, settings.user);
      // }
      if (ability && ability[0] === '*') {
        ability = ability.substr(1);
        abilityDisabled = true;
      }
      let hasAbility = !ability || settings.abilities[ability] || false;
      if (
        (!field.view)
        // || (field.path === '_id' && !isNew)
        || (!hasAbility && !abilityDisabled)
        || checkDepends(field.hidden, record)
        || (!settings.superMode && checkDepends(field.super, record))
      ) {
        delete this.fieldRefs[field.path];
        return;
      }

      let ViewClass = views.components[field.view];
      if (!ViewClass) {
        console.error('Missing : ' + field.view);
        ViewClass = views.components.TextFieldView;
      }

      let fieldDisabled = disabled;
      if (!fieldDisabled && !hasAbility) {
        fieldDisabled = abilityDisabled;
      }
      if (!fieldDisabled) {
        fieldDisabled = checkDepends(field.disabled, record);
      }

      let label = tr(field.label, serviceId);
      let help = tr(field.help, serviceId);
      let value: any = record[field.path];
      let fixed = checkDepends(field.fixed, record);
      if (fixed) {
        fieldClasses.push('fixed');
      }
      if (!hasAbility) {
        fieldClasses.push('no-ability');
      }
      if (fieldDisabled) {
        fieldClasses.push('disabled');
      }
      // @ts-ignore
      fields.push(React.createElement(ViewClass, {
        key: field.path,
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
      isNew,
      panel,
      title,
      path,
      settings,
      disabled,
      wrapper
    } = props;
    let { ability } = props;
    let abilityDisabled = false;
    // if (typeof ability === 'function') {
    //   ability = ability(record, settings.user);
    // }
    if (ability && ability[0] === '*') {
      ability = ability.substr(1);
      abilityDisabled = true;
    }
    let hasAbility = !ability || settings.abilities[ability] || false;
    if (!hasAbility && !abilityDisabled) return ''; // ability
    if (checkDepends(props.hidden, record)) return ''; // hidden
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
      } else if (!model.abilities[action]) { return true }
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
      let heading = title ? <div className="card-title">{tr(title)}</div> : null;
      el = (
        <div className={model.id + '-group-' + path + ' card'}>
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
