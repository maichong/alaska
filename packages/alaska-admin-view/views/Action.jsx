// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import TooltipWrapper from './TooltipWrapper';

const NULL = <div />;

type Props = {
  model: Alaska$view$Model,
  action: Alaska$Model$action,
  selected?: Array<any>,
  disabled?: boolean,
  record?: Object,
  onClick?: Function,
  link?: string,
  refresh?: Function,
};

type Context = {
  views: Alaska$view$Views,
  router: Object,
  t: Function
};

export default class Action extends React.Component<Props> {
  static defaultProps = {
    link: '',
    disabled: false,
    selected: []
  };

  static contextTypes = {
    views: PropTypes.object,
    router: PropTypes.object,
    t: PropTypes.func
  };

  context: Context;

  shouldComponentUpdate(props: Props) {
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
    let {
      model, action, record, selected, disabled, refresh
    } = this.props;
    const { t } = this.context;
    if (action.view) {
      let View = this.context.views[action.view];
      if (!View) {
        console.error(`Action view ${action.view} missing`);
        return NULL;
      }
      // $Flow
      return React.createElement(View, {
        model, action, selected, record, refresh
      });
    }
    // if (!model.abilities[action.key]) return NULL;
    if (!disabled && !record && action.needRecords && (!selected || selected.length < action.needRecords)) {
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
      >{action.icon ? <i className={'fa fa-' + action.icon} /> : null} {title}
      </button>
    );
    if (action.tooltip) {
      return (
        <TooltipWrapper
          placement="top"
          tooltip={t(action.tooltip)}
        >{el}
        </TooltipWrapper>
      );
    }
    return el;
  }
}
