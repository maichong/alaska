// @flow

import React from 'react';
import Menu from './Menu';
import Copyright from './Copyright';
import Node from './Node';
import Logo from './Logo';

const { object } = React.PropTypes;

export default class Sidebar extends React.Component {

  static contextTypes = {
    router: object
  };

  props: {
    menu: Object[],
    layout: string
  };

  state: Object;

  constructor(props: Object) {
    super(props);
    this.state = {
      menu: ''
    };
  }

  handleChange = (item: Object) => {
    this.context.router.push(item.link);
    this.setState({ menu: item.id });
  };

  render() {
    let { menu, layout } = this.props;
    if (layout === 'hidden') {
      return <div />;
    }
    return (
      <Node id="sidebar">
        <Node id="sidebarInner">
          <Logo />
          <Menu items={menu} layout={layout} value={this.state.menu} onChange={this.handleChange} level={0} />
          <Copyright layout={layout} />
        </Node>
      </Node>
    );
  }
}
