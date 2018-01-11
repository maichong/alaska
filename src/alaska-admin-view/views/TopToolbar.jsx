// @flow

import React from 'react';
import Node from './Node';

type Props = {
  children: React$Node,
  actions?: React$Node
};

export default class TopToolbar extends React.Component<Props> {
  render() {
    const { children, actions } = this.props;
    return (
      <Node id="topToolbar" className="top-toolbar">
        <div className="top-toolbar-inner">
          <div className="top-toolbar-title">{children}</div>
          <Node id="topToolbarActions" className="top-toolbar-actions">{actions}</Node>
        </div>
      </Node>
    );
  }
}
