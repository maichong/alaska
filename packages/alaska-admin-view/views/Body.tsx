import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Node from './Node';
import HomePage from './HomePage';
import ListPage from './ListPage';
import ErrorPage from './ErrorPage';
import EditorPage from './EditorPage';
import { BodyProps, Route as RouteItem } from '..';

interface BodyState {
}

export default class Body extends React.Component<BodyProps, BodyState> {

  static contextTypes = {
    views: PropTypes.object
  };

  context: any;
  constructor(props: BodyProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { views } = this.context;
    return (
      <Node
        className="body"
        wrapper="Body"
        props={this.props}
      >
        <Switch>
          <Route component={HomePage} exact path="/" />
          <Route component={ListPage} exact path="/list/:service/:model" />
          <Route component={EditorPage} exact path="/edit/:service/:model/:id" />
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
