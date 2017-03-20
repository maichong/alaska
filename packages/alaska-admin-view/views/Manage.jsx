// @flow

import React from 'react';
import { connect } from 'react-redux';
import Node from './Node';
import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';
import type { Settings } from '../types';

class Manage extends React.Component {

  props: {
    children: any;
    settings: Settings;
    layout: string;
  };

  render() {
    let { children, settings, layout } = this.props;
    return (<Node id="manage">
      <Sidebar menu={settings.menu} layout={layout} />
      <Node id="body">
        <Header />
        <Content>{children}</Content>
      </Node>
    </Node>);
  }
}

export default connect(({ settings, layout }) => ({ settings, layout }))(Manage);
