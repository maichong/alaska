import * as _ from 'lodash';
import * as React from 'react';
import { WidgetGroupProps, views } from '..';
import Node from './Node';
import LocaleWidget from './LocaleWidget';
import RefreshWidget from './RefreshWidget';
import UserWidget from './UserWidget';
import LogoutWidget from './LogoutWidget';

export default class WidgetGroup extends React.Component<WidgetGroupProps> {
  render() {
    const { widgets } = views;
    let widgetViews = _.map(widgets, (Item, index) => <Item key={index} />);
    return (
      <Node
        tag="ul"
        wrapper="WidgetGroup"
        props={this.props}
        className="widget-group"
      >
        {widgetViews}
        <LocaleWidget />
        <RefreshWidget />
        <LogoutWidget />
        <UserWidget />
      </Node>
    );
  }
}
