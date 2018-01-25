//@flow

import React from 'react';
import type { Props } from 'alaska-admin-view/views/Loading';

export default class Loading extends React.Component<Props> {
  render() {
    let { className, text } = this.props;
    className = className ? ' ' + className : '';
    className = 'loading' + className;
    return (
      <div className={className}>
        <div className="loading-text">{text || 'Loading...'}</div>
      </div>
    );
  }
}
