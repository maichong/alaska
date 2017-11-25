// @flow

import React from 'react';
import { Overlay } from 'react-bootstrap';
import Node from './Node';

type Props = {
  children: React$Node,
  actions?: Array<React$Element<any>>
};

type State = {
  show: boolean
};

export default class ContentHeader extends React.Component<Props, State> {
  constructor(props: Props) {
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
      el = <Node id="contentHeaderActions" className="content-header-actions">{actions}</Node>;
    } else {
      el = <i className="fa fa-bars" />;
      let overlay = null;
      if (this.state.show) {
        overlay = <Overlay show onHide={() => this.setState({ show: false })} rootClose>
          <div className="content-header-actions overlay">
            <div>{actions.map((a) => <div key={a.key} className="action">{a}</div>)}</div>
          </div>
        </Overlay>;
      }
      el = <div className="actions-toggle content-header-actions" onClick={this.taggleActions}>
        {el}
        {overlay}
      </div>;
    }
    return (
      <Node id="contentHeader" className="content-header">
        <div className="content-header-title">{children}</div>
        {el}
      </Node>
    );
  }
}
