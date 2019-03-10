import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import * as classnames from 'classnames';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import checkAbility from '../utils/check-ability';
import { ActionViewProps, views } from '..';

export default class ActionView extends React.Component<ActionViewProps> {
  static contextTypes = {
    router: PropTypes.object
  };

  handleClick = () => {
    let { onClick, link, record } = this.props;
    if (onClick) {
      onClick();
      return;
    }
    if (link) {
      link = link.replace(/\{([a-z0-9_]+)\}/ig, (all, word) => {
        if (record.hasOwnProperty(word)) {
          return record[word];
        }
        return '';
      });
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

    let title: React.ReactNode;
    if (action.title) {
      title = tr(action.title, model && model.serviceId);
    }
    if (title) {
      title = <span className="action-title">{title}</span>;
    }
    let el = (
      <button
        onClick={this.handleClick}
        className={classnames('btn', `btn-${action.color || 'light'}`, {
          'with-icon': !!action.icon,
          'with-title': !!title
        })}
        disabled={disabled}
        key={action.key}
      >
        {action.icon ? <i className={`action-icon fa fa-${action.icon}`} /> : null} {title}
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
