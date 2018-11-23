import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import { ActionViewProps } from '..';

interface ActionViewState {
}

export default class ActionView extends React.Component<ActionViewProps, ActionViewState> {
  static contextTypes = {
    views: PropTypes.object,
    router: PropTypes.object
  };

  context: any;
  constructor(props: ActionViewProps) {
    super(props);
    this.state = {};
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
      editor, model, action, record, records, selected
    } = this.props;

    if (action.view) {
      let View = this.context.views[action.view];
      if (!View) {
        console.error(`Action view ${action.view} missing`);
        return null;
      }

      return React.createElement(View, {
        editor, model, action, records, selected, record, disabled: !!action.disabled
      });
    }

    let title: string;
    if (action.title) {
      title = tr(action.title, model.serviceId);
    }
    let el = (
      <button
        onClick={this.handleClick}
        className={'btn btn-' + (action.style || 'default')}
        disabled={!!action.disabled}
        key={action.key}
      >
        {action.icon ? <i className={'fa fa-' + action.icon} /> : null} {title}
      </button >
    );
    if (action.tooltip) {
      return (
        <TooltipWrapper
          placement="top"
          tooltip={tr(action.tooltip)}
        >{el}
        </TooltipWrapper>
      );
    }
    return el;
  }
}