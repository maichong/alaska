import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import checkAbility from '../utils/check-ability';
import { ActionViewProps, views } from '..';

export default class ActionView extends React.Component<ActionViewProps> {
  static contextTypes = {
    router: PropTypes.object
  };

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

    let disabled = action.disabled && checkAbility(action.disabled, record);

    if (action.view) {
      let View = views.components[action.view];
      if (!View) {
        console.error(`Action view ${action.view} missing`);
        return null;
      }

      return React.createElement(View, {
        // @ts-ignore 自定义Props
        editor, model, action, records, selected, record, disabled
      });
    }

    let title: string;
    if (action.title) {
      title = tr(action.title, model.serviceId);
    }
    let el = (
      <button
        onClick={this.handleClick}
        className={`btn btn-${action.style || 'default'}`}
        disabled={disabled}
        key={action.key}
      >
        {action.icon ? <i className={`fa fa-${action.icon}`} /> : null} {title}
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
