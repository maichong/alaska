import * as React from 'react';
import * as tr from 'grackle';
import Node from './Node';
import { ErrorPageProps } from '..';

export default class ErrorPage extends React.Component<ErrorPageProps> {
  render() {
    return (
      <Node
        wrapper="ErrorPage"
        props={this.props}
        className="error-page"
      >
        <div className="error-info">
          <div className="error-title">{tr('Not found!')}</div>
          <div className="error-desc">{tr('Requested page not found.')}</div>
        </div>
      </Node>
    );
  }
}
