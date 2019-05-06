import * as React from 'react';
import * as tr from 'grackle';
import * as classnames from 'classnames';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import checkAbility from '../utils/check-ability';
import { ActionViewProps, views } from '..';

export default class ActionView extends React.Component<ActionViewProps> {
  handleClick = (e: any) => {
    e.stopPropagation();
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
      this.props.history.push(link);
    }
  };

  render() {
    let {
      editor, model, action, record, records, selected, icon
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
        editor, model, action, records, selected, record, disabled, icon
      });
    }

    let title: React.ReactNode;
    if (action.title) {
      title = tr(action.title, model && model.serviceId);
    }
    if (title) {
      title = <span className="action-title">{title}</span>;
    }
    let el = null;
    if (icon && action.icon) {
      el = <i
        className={`fa fa-${action.icon} text-${action.color || 'primary'}`}
        onClick={disabled ? null : this.handleClick}
      />;
    } else {
      el = (
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
    }
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
