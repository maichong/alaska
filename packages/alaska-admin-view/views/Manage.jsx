// @flow

import React from 'react';

import { connect } from 'react-redux';
import Node from './Node';

import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';

class Manage extends React.Component {

  props: {
    children: any;
    settings: Object;
  };

  render() {
    let { children, settings } = this.props;
    return (<Node id="manage">
      <Sidebar menu={settings.menu} layout={this.props.layout} />
      <Node id="body">
        <Header />
        <Content>{children}</Content>
      </Node>
    </Node>);
  }
}

export default connect(({ settings, layout }) => ({ settings, layout }))(Manage);
