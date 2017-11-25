// @flow

import React from 'react';
import { connect } from 'react-redux';
import Node from './Node';
import Header from './Header';
import Sidebar from './Sidebar';
import Content from './Content';

type Props = {
  children: React$Node,
  settings: Alaska$view$Settings,
  layout: string
};

class Manage extends React.Component<Props> {
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

export default connect(
  ({ settings, layout }) => ({ settings, layout }),
  () => ({})
)(Manage);
