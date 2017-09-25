// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import shallowEqualWithout from 'shallow-equal-without';
import TooltipWrapper from './TooltipWrapper';
import type { Model, Action as ActionData, Views } from '../types';

const NULL = <div />;

export default class Action extends React.Component {
  static defaultProps = {
    link: '',
    refresh: null,
    onClick: null,
    disabled: false,
    selected: [],
    data: null
  };

  static contextTypes = {
    views: PropTypes.object,
    router: PropTypes.object,
    t: PropTypes.func
  };

  context: {
    views: Views;
    t: Function
  };

  props: {
    model: Model,
    action: ActionData,
    selected?: Array<any>,
    disabled?: boolean,
    data?: Object,
    onClick?: Function,
    link?: string;
    refresh?: Function,
  };

  shouldComponentUpdate(props: Object) {
    return !shallowEqualWithout(props, this.props);
  }

  handleClick = () => {
    const { onClick, link } = this.props;
    if (onClick) {
      onClick();
      return;
    }
    if (link) {
      this.context.router.push(link);
    }
  };

  render() {
    let { model, action, data, selected, disabled, refresh } = this.props;
    const { t } = this.context;
    if (action.view) {
      let View = this.context.views[action.view];
      if (!View) {
        console.error(`Action view ${action.view} missing`);
        return NULL;
      }
      return React.createElement(View, { model, action, selected, data, refresh });
    }
    // if (!model.abilities[action.key]) return NULL;
    if (!disabled && !data && action.needRecords && (!selected || selected.length < action.needRecords)) {
      disabled = true;
    }
    let title;
    if (action.title) {
      title = t(action.title, model.serviceId);
    }
    let el = (
      <button
        onClick={this.handleClick}
        className={'btn btn-' + (action.style || 'default')}
        key={action.key}
        disabled={disabled}
      >{action.icon ? <i className={'fa fa-' + action.icon} /> : null} {title}</button>
    );
    if (action.tooltip) {
      return (
        <TooltipWrapper
          placement="top"
          tooltip={t(action.tooltip)}
        >{el}</TooltipWrapper>
      );
    }
    return el;
  }
}
