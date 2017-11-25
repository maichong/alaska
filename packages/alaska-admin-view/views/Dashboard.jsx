// @flow

import React from 'react';
import Node from './Node';

type Props = {
  children: React$Node
};
export default class Dashboard extends React.Component<Props> {
  render() {
    return (
      <Node id="dashboard">
        <div className="dashboard-placeholder">Wellcome</div>
      </Node>
    );
  }
}
