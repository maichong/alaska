// @flow

import React from 'react';
import Node from './Node';

export default class Dashboard extends React.Component {

  props: {
    children: any
  };

  render() {
    return (
      <Node id="dashboard">
        <div className="dashboard-placeholder">Wellcome</div>
      </Node>
    );
  }
}
