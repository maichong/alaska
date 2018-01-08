// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import checkDepends from 'check-depends';
import TooltipWrapper from './TooltipWrapper';

type Props = {
  editor?: boolean,
  model: Alaska$view$Model,
  action: Alaska$Model$action,
  records?: Alaska$view$Record[],
  selected?: Alaska$view$Record[],
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
      this.context.router.history.push(link);
    }
  };

  render() {
    let {
      editor, model, action, record, records, selected, disabled, refresh
    } = this.props;
    const { t } = this.context;
    // needRecords
    if (!disabled && !record && action.needRecords && (!selected || selected.length < action.needRecords)) {
      disabled = true;
    }
    if (!disabled && record && action.disabled && checkDepends(action.disabled, record)) {
      disabled = true;
    }
    if (action.view) {
      let View = this.context.views[action.view];
      if (!View) {
        console.error(`Action view ${action.view} missing`);
        return null;
      }
      // $Flow
      return React.createElement(View, {
        editor, model, action, records, selected, record, refresh, disabled
      });
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
