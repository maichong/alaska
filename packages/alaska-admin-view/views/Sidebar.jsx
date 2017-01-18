/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-29
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import Menu from './Menu';
import Copyright from './Copyright';
import Node from './Node';
import Logo from './Logo';

const { array, string, object } = React.PropTypes;

export default class Sidebar extends React.Component {

  static propTypes = {
    menu: array,
    layout: string
  };

  static contextTypes = {
    router: object
  };

  constructor(props) {
    super(props);
    this.state = {
      menu: ''
    };
  }

  handleChange = (item) => {
    this.context.router.push(item.link);
    this.setState({ menu: item.id });
  };

  render() {
    let { menu, layout } = this.props;
    if (layout == 'hidden') {
      return <div></div>;
    }
    return (
      <Node id="sidebar">
        <Node id="sidebarInner">
          <Logo/>
          <Menu items={menu} layout={layout} value={this.state.menu} onChange={this.handleChange}/>
          <Copyright layout={layout} />
        </Node>
      </Node>
    );
  }
}
