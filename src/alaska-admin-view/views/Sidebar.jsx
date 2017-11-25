// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Menu from './Menu';
import Copyright from './Copyright';
import Node from './Node';
import Logo from './Logo';

type Props = {
  menu: Object[],
  layout: string
};

export default class Sidebar extends React.Component<Props, Object> {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      menu: ''
    };
  }

  handleChange = (item: Object) => {
    const { history } = this.context.router;
    history.push(item.link);
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
