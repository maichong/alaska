// @flow

import React from 'react';
import Node from './Node';

const { node } = React.PropTypes;

export default class Dashboard extends React.Component {

  static propTypes = {
    children: node
  };

  render() {
    return (
      <Node id="dashboard">
        <div className="dashboard-placeholder">Wellcome</div>
      </Node>
    );
  }
}
