// @flow

import React from 'react';
import type { Props } from 'alaska-admin-view/views/TopToolbar';
import Node from './Node';

export default class TopToolbar extends React.Component<Props> {
  render() {
    const { children, tools } = this.props;
    return (
      <Node id="topToolbar" className="top-toolbar">
        <div className="top-toolbar-inner">
          <div className="top-toolbar-title">{children}</div>
          <Node id="topToolbarActions" className="top-toolbar-actions">{tools}</Node>
        </div>
      </Node>
    );
  }
}
