import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import Node from './Node';
import HomePage from './HomePage';
import ListPage from './ListPage';
import ErrorPage from './ErrorPage';
import EditorPage from './EditorPage';
import { BodyProps, Route as RouteItem, views } from '..';

export default class Body extends React.Component<BodyProps> {
  render() {
    return (
      <Node
        className="body"
        wrapper="Body"
        props={this.props}
      >
        <Switch>
          <Route component={HomePage} exact path="/" />
          <Route component={ListPage} exact path="/list/:service/:model" />
          <Route component={EditorPage} path="/edit/:service/:model/:id/:tab?" />
          {
            (views.routes || []).map((item: RouteItem) => (
              <Route key={item.path} component={item.component} exact path={item.path} />))
          }
          <Route component={ErrorPage} />
        </Switch>
      </Node>
    );
  }
}
