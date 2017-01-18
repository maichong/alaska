/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-12
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import Node from './Node';
import Overlay from 'react-bootstrap/lib/Overlay';

const { node, array } = React.PropTypes;

export default class ContentHeader extends React.Component {

  static propTypes = {
    children: node,
    actions: array
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  taggleActions = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { children, actions } = this.props;
    let el = null;
    if (window.innerWidth > 768 || !actions || actions.length < 2) {
      el = <Node wrapper="contentHeaderActions" className="content-header-actions">{actions}</Node>
    } else {
      el = <i className="fa fa-bars"/>;
      let overlay = null;
      if (this.state.show) {
        overlay = <Overlay show={true} onHide={() => this.setState({ show: false })} rootClose={true}>
          <div className="content-header-actions overlay">
            <div>{actions.map((a, index)=><div key={index} className="action">{a}</div>)}</div>
          </div>
        </Overlay>;
      }
      el = <div className="actions-toggle content-header-actions" onClick={this.taggleActions}>
        {el}
        {overlay}
      </div>;
    }
    return (
      <Node wrapper="contentHeader" className="content-header">
        <div className="content-header-title">{children}</div>
        {el}
      </Node>
    );
  }
}
